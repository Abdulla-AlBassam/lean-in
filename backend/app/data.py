import json
from pathlib import Path

_DATA = Path(__file__).parent.parent / "data"
_people = None
_results = None


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
