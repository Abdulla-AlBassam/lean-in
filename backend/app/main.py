from dotenv import load_dotenv
load_dotenv()

import logging
import urllib.parse
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import HealthResponse, PersonResponse
from .search import search as run_search, PARTY_META, NATION_PARTIES
from .classify import load_axes, classify
from .data import load_people, load_results, resolve_person, lookup_unbaked_mp

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Lean In", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse()


@app.get("/api/search")
def search(q: str = Query(..., min_length=1, max_length=200), nation: str = "UK"):
    q = q.strip()
    if not q:
        raise HTTPException(400, detail="Empty query")
    if nation not in {"UK", "ENG", "SCO", "WAL", "NIR"}:
        raise HTTPException(400, detail=f"Unknown nation '{nation}'. Valid: UK, ENG, SCO, WAL")
    if nation == "NIR":
        raise HTTPException(400, detail="Northern Ireland uses a different party system; not supported in v1")

    person_id = resolve_person(q)
    if person_id:
        person = load_people()[person_id]
        party_ids = NATION_PARTIES.get(nation, NATION_PARTIES["UK"])
        timeline = load_results().get("by_person", {}).get(person_id, [])
        parties = []
        for pid in party_ids:
            meta = PARTY_META[pid]
            if pid == person["party_id"]:
                parties.append({
                    "id": pid, "name": meta["name"], "colour": meta["colour"],
                    "empty": False,
                    "person_summary": person.get("person_summary", ""),
                    "citations": person.get("citations", []),
                })
            else:
                parties.append({"id": pid, "name": meta["name"], "colour": meta["colour"], "empty": True})
        logger.info("person search q=%r nation=%s id=%s", q, nation, person_id)
        return {"query_type": "person", "person": {**person, "results": timeline}, "parties": parties}

    # CSV fallback for MPs who aren't in the curated people.json. We have name + party +
    # constituency from the GE 2024 results dataset; the rest is filled with placeholders
    # and a static party-pointing summary. Only triggers when the MP's party is in the
    # cards rail for this nation — otherwise fall through to classify (returns 400).
    mp = lookup_unbaked_mp(q)
    if mp and mp["party_id"] in NATION_PARTIES.get(nation, []):
        pid = mp["party_id"]
        meta = PARTY_META[pid]
        thin_id = "-".join(mp["mp"].lower().replace("'", "").split())
        thin_summary = (
            f"We don't have a curated profile for this MP yet — search a topic like 'NHS' "
            f"or 'housing' to see {meta['name']}'s manifesto position."
        )
        thin_person = {
            "id": thin_id,
            "name": mp["mp"],
            "aliases": [],
            "party_id": pid,
            "constituency": mp["name"],
            "role": "Member of Parliament",
            "photo_url": "",
            "bio": f"{meta['name']} MP for {mp['name']}, elected July 2024 with a majority of {mp['majority']:,}.",
            "links": [
                {"label": "Wikipedia search", "url": f"https://en.wikipedia.org/wiki/Special:Search?search={urllib.parse.quote_plus(mp['mp'])}"},
                {"label": "TheyWorkForYou search", "url": f"https://www.theyworkforyou.com/mps/?f={urllib.parse.quote_plus(mp['mp'])}"},
            ],
            "person_summary": thin_summary,
            "citations": [],
            "results": [],
        }
        parties = []
        for ppid in NATION_PARTIES.get(nation, []):
            pmeta = PARTY_META[ppid]
            if ppid == pid:
                parties.append({
                    "id": ppid, "name": pmeta["name"], "colour": pmeta["colour"],
                    "empty": False,
                    "person_summary": thin_summary,
                    "citations": [],
                })
            else:
                parties.append({"id": ppid, "name": pmeta["name"], "colour": pmeta["colour"], "empty": True})
        logger.info("csv-thin search q=%r nation=%s mp=%r party=%s", q, nation, mp["mp"], pid)
        return {"query_type": "person", "person": thin_person, "parties": parties}

    axis_id, _, _ = classify(q)
    if axis_id == "unknown":
        raise HTTPException(400, detail="Query doesn't match any policy topic we cover. Try: NHS, housing, immigration, climate, education, or the economy.")
    logger.info("search q=%r nation=%s axis=%s", q, nation, axis_id)
    result = run_search(q, nation)
    return {**result.model_dump(), "query_type": "topic"}


@app.get("/api/person/{person_id}", response_model=PersonResponse)
def get_person(person_id: str):
    people = load_people()
    if person_id not in people:
        raise HTTPException(404, detail="Person not found")
    person = people[person_id]
    timeline = load_results().get("by_person", {}).get(person_id, [])
    return PersonResponse(**{**person, "timeline": timeline})


@app.get("/api/axes")
def axes():
    return {"axes": load_axes()}
