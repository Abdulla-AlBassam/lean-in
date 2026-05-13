import json
from pathlib import Path

_DATA = Path(__file__).parent.parent / "data"
_people = None
_results = None
_mp_index = None


def load_people() -> dict:
    global _people
    if _people is None:
        _people = json.loads((_DATA / "people.json").read_text(encoding="utf-8"))["people"]
    return _people


def load_results() -> dict:
    global _results
    if _results is None:
        _results = json.loads((_DATA / "results.json").read_text(encoding="utf-8"))
    return _results


def resolve_person(query: str) -> str | None:
    q = query.lower().strip()
    for person_id, person in load_people().items():
        if q == person["name"].lower() or q in [a.lower() for a in person.get("aliases", [])]:
            return person_id
    return None


def load_mp_index() -> dict:
    # Inverted index: lowercase MP name -> constituency record. Built once at first call.
    # We exclude MPs already curated in people.json so a baked profile never gets shadowed
    # by a thin CSV entry. Source: frontend/public/uk-constituency-results.json
    # (UK Parliament Open Parliament Licence, GE July 2024 winners).
    global _mp_index
    if _mp_index is None:
        path = _DATA / "uk-constituency-results.json"
        results = json.loads(path.read_text(encoding="utf-8"))["results"]
        baked_names = {p["name"].lower() for p in load_people().values()}
        _mp_index = {}
        for ons_code, rec in results.items():
            key = rec["mp"].lower()
            if key in baked_names:
                continue
            _mp_index[key] = {**rec, "ons_code": ons_code}
    return _mp_index


def lookup_unbaked_mp(query: str) -> dict | None:
    return load_mp_index().get(query.lower().strip())
