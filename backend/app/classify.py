import json
from pathlib import Path

AXES_PATH = Path(__file__).parent.parent / "data" / "axes.json"


def load_axes() -> list[dict]:
    return json.loads(AXES_PATH.read_text())["axes"]


def classify(query: str) -> tuple[str, str, list[str]]:
    # Deterministic keyword match against axis keywords. No LLM call.
    # Returns (axisId, axisLabel, keywords) or ("unknown", "Off-topic", []) if nothing matches.
    q = query.lower()
    best, best_score = None, 0
    for axis in load_axes():
        score = sum(1 for kw in axis["keywords"] if kw in q)
        if score > best_score:
            best, best_score = axis, score
    if not best:
        return "unknown", "Off-topic", []
    return best["id"], best["label"], best["keywords"]
