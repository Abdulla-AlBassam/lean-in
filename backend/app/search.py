import json
import os
from pathlib import Path

from .llm import client
from .models import SearchResponse, PartyPOV, Citation
from .classify import classify

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
    "NIR": [],  # unsupported nation, handled at the route layer
}

SYSTEM_PROMPT = """You are a neutral political analyst. You will be given the full text of UK party manifestos. The user asks a question about a topic. For each requested party, return a 1-2 sentence summary of that party's position on the topic, plus 1-2 direct quotes from their manifesto with page citation.

Rules:
- Every claim must be backed by a verbatim quote from the manifesto provided.
- Use neutral descriptive language. Do not editorialise.
- If a party's manifesto does not address the topic, say so plainly. Do not invent positions.
- Output strict JSON matching the schema below. No prose, no markdown fences."""


def load_manifestos(party_ids: list[str]) -> list[dict]:
    out = []
    for pid in party_ids:
        path = MANIFESTO_DIR / f"{pid}.md"
        if path.exists():
            out.append({"id": pid, "text": path.read_text()})
    return out


def search(query: str, nation: str) -> SearchResponse:
    if os.environ.get("DEMO_MODE", "").lower() == "true":
        return load_demo_cached(query, nation)

    axis_id, axis_label = classify(query)
    party_ids = NATION_PARTIES.get(nation, [])
    manifestos = load_manifestos(party_ids)

    # Build the cached system block: large, stable, prompt-cached.
    system_blocks = [{"type": "text", "text": SYSTEM_PROMPT}]
    for m in manifestos:
        system_blocks.append({
            "type": "text",
            "text": f"=== {PARTY_META[m['id']]['name']} Manifesto ===\n\n{m['text']}",
            "cache_control": {"type": "ephemeral"},
        })

    user_msg = f"Topic: {query}\nNation scope: {nation}\nReturn JSON: {{ \"parties\": [{{ \"id\": \"<party_id>\", \"summary\": \"...\", \"citations\": [{{ \"quote\": \"...\", \"source\": \"<party> Manifesto 2024, p.X\" }}] }}, ...] }}"

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

    parties = [
        PartyPOV(
            id=p["id"],
            name=PARTY_META[p["id"]]["name"],
            colour=PARTY_META[p["id"]]["colour"],
            summary=p["summary"],
            citations=[Citation(**c) for c in p["citations"]],
        )
        for p in parsed["parties"]
        if p["id"] in PARTY_META
    ]

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
