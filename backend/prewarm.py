"""
Run once with DEMO_MODE=false to populate demo_cache/ for all demo queries.
Waits 70s between calls to stay within the 10k input-tokens/min free-tier limit.
15 queries × ~70s = ~17 minutes total. Run this the evening before the demo.
"""
from dotenv import load_dotenv
load_dotenv()

import sys
import time
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
        if done < total:
            print(f"  waiting 70s before next call...")
            time.sleep(70)

print("\nAll done. demo_cache/ is ready.")
