"""
Run once with DEMO_MODE=false to populate demo_cache/ for all demo queries.
Keyword extraction keeps each call under 4k tokens — no rate-limit waits needed.
"""
from dotenv import load_dotenv
load_dotenv()

import sys
sys.path.insert(0, '.')
from app.search import search, cache_path

QUERIES = ["tuition fees", "NHS waiting times", "renters rights", "immigration", "climate policy"]
NATIONS = ["UK", "SCO", "WAL"]

total = len(QUERIES) * len(NATIONS)
done = 0

for q in QUERIES:
    for nation in NATIONS:
        done += 1
        path = cache_path(q, nation)
        if path.exists():
            print(f"[{done}/{total}] SKIP (cached): {nation} / {q!r}")
            continue
        print(f"[{done}/{total}] Fetching: {nation} / {q!r} ...", end=" ", flush=True)
        result = search(q, nation)
        print(f"OK ({len(result.parties)} parties)")

print("\nAll done. demo_cache/ is ready.")
