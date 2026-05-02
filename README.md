# Lean In

UK politics, plainly. Open the map, click your nation, search any policy topic. See where every major party stands — every claim a verbatim quote from that party's own manifesto.

- **Repo:** https://github.com/Abdulla-AlBassam/lean-in
- **Hackathon deadline:** end of day Sunday 2026-05-03

## Read these before you write code

1. **`CLAUDE.md`** — project rules. Code style, architectural rules, demo-mode, slop sweep.
2. **`contracts.md`** — the API shapes Builder A and Builder B agree on. The single source of truth.
3. Your builder brief in `briefs/`.
4. The skill docs in `skills/`.

## Quick start

```bash
git clone https://github.com/Abdulla-AlBassam/lean-in
cd lean-in

# frontend (Builder B)
cd frontend && npm install && npm run dev      # → http://localhost:5173

# backend (Builder A) — separate terminal
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                            # paste your key into .env
uvicorn app.main:app --reload --port 8000      # → http://localhost:8000
```

`curl http://localhost:8000/api/health` should return `{"status":"ok"}`.

## Stack

- **Backend:** Python 3.11+, FastAPI, anthropic SDK, pydantic. Port 8000.
- **Frontend:** React 18 + Vite + plain CSS + Leaflet. JS not TS. Port 5173.
- **LLM:** `claude-sonnet-4-6`. Prompt caching mandatory on the manifesto context.
- **Data:** ONS GeoJSON (UK nations), curated party manifestos, hand-coded axis positions in `backend/data/axes.json`.

No database. No vector store. Manifestos sit in the Claude context with prompt caching — the model sees the full source so citations are guaranteed real.

## Roles

| Role | Builder | Brief |
|---|---|---|
| **Builder A — Backend (Python/FastAPI)** | Saliha (saliha006) | `briefs/builder-a-backend.md` |
| **Builder B — Frontend (React/Leaflet)** | Abdulla (Abdulla-AlBassam) | `briefs/builder-b-frontend.md` |
| **Builder C — Claude / LLM prompts** | Elya (ElyaRaza) | `briefs/builder-c-claude.md` |
| **Builder D — Data + demo + presenter** | Maks (maksymkhomitskyi) | `briefs/builder-d-data.md` |
| **Helper / floater** | Aws (awszaman) | shadows Builder D, fills wherever blocked |

## Git rules

- Branch off `main`: `builder-a`, `builder-b`, `builder-c`, `builder-d`.
- **Only Builder A merges to `main`.** PR or push-then-Saliha-merges.
- Commits: short, present tense. `add /api/search route`, `wire map to nation selector`. Not `feat: comprehensive ⚡`.
- Don't edit a file outside your lane — ping the owner.

## Folder structure

```
/
├── CLAUDE.md            # project rules — read first
├── README.md            # this file
├── contracts.md         # API shapes A and B both honour
├── briefs/              # one brief per builder
│   ├── builder-a-backend.md
│   ├── builder-b-frontend.md
│   ├── builder-c-claude.md
│   └── builder-d-data.md
├── skills/              # reference docs
│   ├── uk-map.md        # Leaflet + UK nations
│   └── debug-fast.md    # break the loop when Claude Code spirals
├── backend/             # FastAPI service (Builder A)
│   ├── app/
│   │   ├── main.py
│   │   ├── search.py
│   │   ├── classify.py
│   │   ├── llm.py
│   │   └── models.py
│   ├── data/
│   │   ├── manifestos/  # one .md per party (Builder D)
│   │   └── axes.json    # hand-coded axis positions (Builder D)
│   ├── demo_cache/      # populated by Builder D before submission
│   ├── requirements.txt
│   └── .env.example
└── frontend/            # Vite + React 18 + Leaflet (Builder B)
    ├── src/
    │   ├── App.jsx
    │   ├── Map.jsx
    │   ├── SearchBar.jsx
    │   ├── PartyCard.jsx
    │   ├── SpectrumChart.jsx
    │   ├── api.js
    │   └── styles.css
    └── public/
        └── uk-nations.geojson  # Builder D drops this in
```

## Demo flow (locked)

1. Page loads — UK 4-nation map centred, search bar with cycling placeholder.
2. User types `tuition fees`, hits enter — 3 party cards appear (Lab/Con/LD) with cited quotes; spectrum below.
3. User clicks **Scotland** on the map — same query re-runs, SNP card joins, spectrum updates.
4. User clears, types `renters rights` — content updates fluidly.
5. Tagline: *"One search bar. Every party. Real quotes. Your country."*

If a feature doesn't serve this script, don't build it.

## Bias defence (you will be asked)

> "Every claim is a verbatim quote from the party's own manifesto, page-cited inline. The classifier is deterministic keyword matching, not an LLM. The LLM only summarises and quotes — it cannot invent positions because it can only see the manifesto we give it."

## Sync points

- **Now (Sat morning)** — repo cloned, structure in place, everyone on their branch
- **+3h** — backend `/api/health` reachable; frontend map renders (with placeholder GeoJSON if needed)
- **+6h** — first end-to-end search works on one demo topic
- **+10h** — full integration; all 5 demo queries pre-warmed
- **Sat evening** — feature freeze, slop sweep, demo cache populated, screen recording captured
- **Sun morning** — rehearsal, polish, submit

## Risks (read at H+0)

1. **Contract drift between A and B.** Edit `contracts.md` together when shapes change.
2. **Demo wifi/Anthropic dies.** `DEMO_MODE=true` saves you. Builder D pre-warms cache before submission.
3. **Bad LLM output on weird phrasings.** Builder D QAs 20+ query variants before submission.
