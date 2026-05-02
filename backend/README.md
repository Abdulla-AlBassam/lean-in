# Lean In — backend

FastAPI service. Owned by **Builder A (Saliha)**.

## Run locally

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # then paste real keys into .env
uvicorn app.main:app --reload --port 8000
```

Confirm: `curl http://localhost:8000/api/health` → `{"status":"ok"}`.

## Endpoints

See `/contracts.md` at repo root.

- `GET /api/health` → `{ status: "ok" }`
- `GET /api/search?q=<query>&nation=UK|ENG|SCO|WAL` → `SearchResponse`
- `GET /api/axes` → `{ axes: [...] }`

## How the search works

1. `classify.py` runs a deterministic keyword match on `data/axes.json` to pick an axis (no LLM call).
2. `search.py` loads the relevant party manifestos from `data/manifestos/` into the Claude system prompt with **prompt caching** (`cache_control: { type: "ephemeral" }`). After the first call, repeat queries reuse the cached manifesto context at ~10% cost.
3. Claude returns JSON with one entry per party: short summary + 1-2 direct quotes from the manifesto with citation. We validate against `models.py` and return.
4. Successful responses are written to `demo_cache/`. With `DEMO_MODE=true`, the route reads from the cache instead of calling Claude.

## Demo-mode (CRITICAL)

Before the demo: run every demo query at least once with `DEMO_MODE=false`. This populates `demo_cache/`. Then flip `DEMO_MODE=true` for the actual presentation. If wifi or Anthropic dies, the demo still works.

## API key load-balancing

`llm.py` rotates across every `ANTHROPIC_API_KEY_*` env var. Each teammate adds their key to `.env`; the backend round-robins per call. This spreads cost and bypasses single-account rate limits during the demo.
