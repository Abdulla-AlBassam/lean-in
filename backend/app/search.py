import json
import logging
import os
import re
import time
from pathlib import Path

import anthropic

from .llm import client
from .models import SearchResponse, PartyPOV, Citation
from .classify import classify
from .data import load_results

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

SYSTEM_PROMPT = """You are a neutral political analyst. You will be given the full text of UK party manifestos, each labelled with the party name. The user will give you a policy topic and a list of party IDs to cover.

Output strict JSON only. Your entire response must begin with `{` and end with `}`. No markdown fences, no explanation, no preamble, no prose of any kind before or after the JSON object.

Schema:
{
  "parties": [
    {
      "id": "<party_id as given>",
      "summary": "<1-2 sentences, max 400 chars, neutral descriptive language, no quoted text inline>",
      "citations": [
        {
          "quote": "<exact verbatim substring copied from the manifesto>",
          "source": "<Party Name> Manifesto 2024, p.<X>"
        }
      ]
    }
  ]
}

Rules — follow these without exception:
1. Every quote must be a verbatim substring of the manifesto sections provided below. Copy the exact words as they appear. Do not use any prior knowledge of party manifestos — only quote text present in the sections provided to you right now.
2. If you cannot find the exact words in the manifesto, do not include that citation. Return fewer citations rather than invented ones. Return 1 or 2 citations per party — never more than 2.
3. Page numbers: use the nearest (p.X) marker in the manifesto text. If none is nearby, write "page unknown".
4. If a party's manifesto does not address the topic at all, return summary "The manifesto does not directly address this topic." and citations [].
5. Summaries must be neutral and descriptive. No editorial language, no partisan framing, no quoted text inline.
6. Return exactly the party IDs requested, in the order given. No extra parties."""


def _normalise(text: str) -> str:
    # Join lines within paragraphs so verbatim quote checks match continuous text.
    # PDF-converted manifestos split sentences across lines.
    paragraphs = text.split("\n\n")
    return "\n\n".join(" ".join(p.splitlines()) for p in paragraphs)


def _extract_section(text: str, keywords: list[str], top_k: int = 6) -> str:
    # Rank each page by keyword density and return the top_k most relevant pages.
    # Page-level ranking beats paragraph-level for manifesto PDFs — policy sections
    # cluster on whole pages so we capture both the claim and its surrounding context.
    pages = re.split(r'(\(p\.\d+\))', text)
    scored = []
    i = 0
    while i < len(pages):
        if not re.match(r'\(p\.\d+\)', pages[i]):
            i += 1
            continue
        marker = pages[i]
        content = pages[i + 1] if i + 1 < len(pages) else ""
        combined = (marker + " " + content).lower()
        score = sum(combined.count(kw) for kw in keywords)
        scored.append((score, marker + content))
        i += 2
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [chunk for _, chunk in scored[:top_k]]
    return "\n\n".join(top) if top else text[:2000]


def load_manifestos(party_ids: list[str], keywords: list[str] | None = None) -> list[dict]:
    out = []
    for pid in party_ids:
        path = MANIFESTO_DIR / f"{pid}.md"
        if not path.exists():
            logger.warning("manifesto missing: %s", pid)
            continue
        text = _normalise(path.read_text())
        if keywords:
            text = _extract_section(text, keywords)
        out.append({"id": pid, "text": text})
    return out


def search(query: str, nation: str) -> SearchResponse:
    if os.environ.get("DEMO_MODE", "").lower() == "true":
        return load_demo_cached(query, nation)

    axis_id, axis_label, keywords = classify(query)
    party_ids = NATION_PARTIES.get(nation, [])
    manifestos = load_manifestos(party_ids, keywords)

    system_blocks = [{"type": "text", "text": SYSTEM_PROMPT}]
    for m in manifestos:
        system_blocks.append({
            "type": "text",
            "text": f"=== {PARTY_META[m['id']]['name']} Manifesto (relevant sections) ===\n\n{m['text']}",
            "cache_control": {"type": "ephemeral"},
        })

    user_msg = f"Topic: {query}\nParties: {', '.join(party_ids)}"

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
    start = raw.find("{")
    end = raw.rfind("}") + 1
    parsed = json.loads(raw[start:end])

    by_topic = load_results().get("by_topic", {}).get(axis_id, {})

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
            results=by_topic.get(pid, []),
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
