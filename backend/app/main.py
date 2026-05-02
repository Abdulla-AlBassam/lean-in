from dotenv import load_dotenv
load_dotenv()

import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import HealthResponse, SearchResponse, PersonResponse, Nation
from .search import search as run_search
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


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse()


@app.get("/api/search", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1, max_length=200), nation: Nation = "UK"):
    if nation == "NIR":
        raise HTTPException(400, detail="Northern Ireland uses a different party system; not supported in v1")
    axis_id, _, _ = classify(q)
    if axis_id == "unknown":
        raise HTTPException(400, detail="Query doesn't match any policy topic we cover. Try: NHS, housing, immigration, climate, education, or the economy.")
    logger.info("search q=%r nation=%s axis=%s", q, nation, axis_id)
    return run_search(q, nation)


@app.get("/api/person/{person_id}", response_model=PersonResponse)
def get_person(person_id: str):
    people = load_people()
    if person_id not in people:
        raise HTTPException(404, detail="Person not found")
    person = people[person_id]
    results = load_results()
    timeline = results.get("by_person", {}).get(person_id, [])
    return PersonResponse(**{**person, "timeline": timeline})


@app.get("/api/axes")
def axes():
    return {"axes": load_axes()}
