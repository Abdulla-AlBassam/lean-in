import json
import logging
import os
import time
from pathlib import Path

import anthropic

from .llm import client
from .models import SearchResponse, PartyPOV, Citation
from .classify import classify, load_axes

logger = logging.getLogger(__name__)

MANIFESTO_DIR = Path(__file__).parent.parent / "data" / "manifestos"
DEMO_CACHE = Path(__file__).parent.parent / "demo_cache"

PARTY_META = {
    "labour":       {"name": "Labour",            "colour": "#E4003B"},
    "conservative": {"name": "Conservative",      "colour": "#0087DC"},
    "libdem":       {"name": "Liberal Democrats", "colour": "#FAA61A"},
    "snp":          {"name": "SNP",               "colour": "#FDF38E"},
    "plaid":        {"name": "Plaid Cymru",       "colour": "#005B54"},
}

NATION_PARTIES = {
    "UK":  ["labour", "conservative", "libdem"],
    "ENG": ["labour", "conservative", "libdem"],
    "SCO": ["labour", "conservative", "libdem", "snp"],
    "WAL": ["labour", "conservative", "libdem", "plaid"],
    "NIR": [],
}

SYSTEM_PROMPT = """You are a neutral political analyst. You will be given relevant excerpts from UK party manifestos. The user asks about a topic. For each party, return a 1-2 sentence summary of their position plus 1-2 direct verbatim quotes with page citations.

Rules:
- Every quote must be verbatim text from the excerpt provided. Do not paraphrase.
- Use neutral descriptive language. Do not editorialise.
- If the excerpt does not address the topic, say the manifesto does not address it. Do not invent positions.
- Output strict JSON. No markdown fences, no prose outside the JSON."""


def _axis_keywords(axis_id: str) -> list[str]:
    for ax in load_axes():
        if ax["id"] == axis_id:
            return ax["keywords"]
    return []


def extract_relevant(text: str, keywords: list[str], max_words: int = 800) -> str:
    """Return the highest-scoring paragraphs from text by keyword overlap, up to max_words."""
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    kw_lower = [k.lower() for k in keywords]

    def score(para: str) -> int:
        pl = para.lower()
        return sum(1 for k in kw_lower if k in pl)

    scored = sorted(paras, key=score, reverse=True)
    out, word_count = [], 0
    for para in scored:
        words = para.split()
        if word_count + len(words) > max_words:
            break
        out.append(para)
        word_count += len(words)
    return "\n\n".join(out) if out else text[:max_words * 6]


def load_manifestos(party_ids: list[str]) -> list[dict]:
    out = []
    for pid in party_ids:
        path = MANIFESTO_DIR / f"{pid}.md"
        if not path.exists():
            logger.warning("manifesto missing: %s", pid)
            continue
        out.append({"id": pid, "text": path.read_text()})
    return out


def search(query: str, nation: str) -> SearchResponse:
    if os.environ.get("DEMO_MODE", "").lower() == "true":
        return load_demo_cached(query, nation)

    axis_id, axis_label = classify(query)
    keywords = _axis_keywords(axis_id)
    party_ids = NATION_PARTIES.get(nation, [])
    manifestos = load_manifestos(party_ids)

    system_blocks = [{"type": "text", "text": SYSTEM_PROMPT}]
    for m in manifestos:
        excerpt = extract_relevant(m["text"], keywords)
        system_blocks.append({
            "type": "text",
            "text": f"=== {PARTY_META[m['id']]['name']} Manifesto (relevant excerpts) ===\n\n{excerpt}",
            "cache_control": {"type": "ephemeral"},
        })

    ids_list = ", ".join(f'"{pid}"' for pid in party_ids)
    user_msg = (
        f"Topic: {query}\n"
        f"Return a response for EVERY party listed below, even if their position is UK-wide. "
        f"Use exactly these id strings (lowercase): {ids_list}\n"
        f'Return JSON: {{"parties": [{{"id": "<one of the ids above>", "summary": "...", '
        f'"citations": [{{"quote": "...", "source": "<Party> Manifesto 2024, p.X"}}]}}]}}'
    )

    try:
        msg = client().messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system_blocks,
            messages=[{"role": "user", "content": user_msg}],
        )
    except anthropic.RateLimitError:
        logger.warning("rate limit hit, waiting 65s then retrying")
        time.sleep(65)
        msg = client().messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system_blocks,
            messages=[{"role": "user", "content": user_msg}],
        )

    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1].lstrip("json").strip()
    parsed = json.loads(raw)

    parties = []
    for p in parsed["parties"]:
        pid = p["id"].lower()
        if pid not in PARTY_META or not p.get("citations"):
            continue
        parties.append(PartyPOV(
            id=pid,
            name=PARTY_META[pid]["name"],
            colour=PARTY_META[pid]["colour"],
            summary=p["summary"],
            citations=[Citation(**c) for c in p["citations"]],
        ))

    response = SearchResponse(axisId=axis_id, axisLabel=axis_label, parties=parties)
    save_demo_cache(query, nation, response)
    return response


def cache_path(query: str, nation: str) -> Path:
    safe = "".join(c if c.isalnum() else "_" for c in query.lower())[:60]
    return DEMO_CACHE / f"{nation}__{safe}.json"


def save_demo_cache(query: str, nation: str, response: SearchResponse) -> None:
    DEMO_CACHE.mkdir(exist_ok=True)
    cache_path(query, nation).write_text(response.model_dump_json(indent=2))


def load_demo_cached(query: str, nation: str) -> SearchResponse:
    path = cache_path(query, nation)
    if not path.exists():
        raise RuntimeError(f"DEMO_MODE on but no cache for {nation}/{query!r}")
    return SearchResponse.model_validate_json(path.read_text())
