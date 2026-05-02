from dotenv import load_dotenv
load_dotenv()

import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import HealthResponse, PersonResponse, Nation
from .search import search as run_search, PARTY_META, NATION_PARTIES
from .classify import load_axes, classify
from .data import load_people, load_results

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Lean In", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _find_person(query: str) -> dict | None:
    q = query.lower().strip()
    for person in load_people().values():
        if q == person["name"].lower() or q in [a.lower() for a in person.get("aliases", [])]:
            return person
    return None


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse()


@app.get("/api/search")
def search(q: str = Query(..., min_length=1, max_length=200), nation: Nation = "UK"):
    if nation == "NIR":
        raise HTTPException(400, detail="Northern Ireland uses a different party system; not supported in v1")

    person = _find_person(q)
    if person:
        party_ids = NATION_PARTIES.get(nation, NATION_PARTIES["UK"])
        timeline = load_results().get("by_person", {}).get(person["id"], [])
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
        logger.info("person search q=%r nation=%s id=%s", q, nation, person["id"])
        return {"query_type": "person", "person": {**person, "results": timeline}, "parties": parties}

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
