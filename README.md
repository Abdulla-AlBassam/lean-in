# Lean In

> UK politics, plainly. Search any policy topic — see where every major party stands, backed by verbatim quotes from their own manifestos.

Built at a hackathon in 48 hours. Designed to cut through political spin so voters can make informed decisions.

---

## What it does

Open the map. Pick a nation. Type any policy topic — *renters rights*, *NHS waiting times*, *tuition fees*. Every major party's position appears as a card, each claim a direct quote from that party's 2024 General Election manifesto with a page number you can verify.

Search an MP's name instead and you get their profile: role, constituency, voting record, and where their party stands.

---

## Why this is not just an LLM wrapper

Three layers, only one of which is an LLM:

**1. Real structured data**
Five party manifestos (Labour, Conservative, Lib Dem, SNP, Plaid Cymru) versioned as plain text in the repo. Hand-coded political axis positions in `backend/data/axes.json` with verbatim quotes and page citations. MP profiles from Democracy Club (CC BY 4.0).

**2. Deterministic classifier**
`backend/app/classify.py` does keyword matching against `axes.json` to pick a topic axis. Pure string match. No LLM call. Fast, free, and auditable.

**3. The LLM, used surgically**
One narrow job: given the topic and the relevant manifesto pages in context, produce a short summary per party with 1–2 verbatim quotes and page citations. Strict pydantic-validated output schema. Manifesto context is prompt-cached so repeat queries cost ~10% of a fresh call.

When a judge asks "how do you know it didn't make that up?" — the answer is: the model only sees the manifesto text we give it. Every quote is a verbatim substring of a file in this repo.

---

## Demo

| Step | Action | What you see |
|------|--------|--------------|
| 1 | Page loads | UK 4-nation map, animated search bar |
| 2 | Type `renters rights` | Labour, Conservative, Lib Dem cards — each with a quoted pledge and page number |
| 3 | Click Scotland | SNP card joins; their position on devolved housing policy |
| 4 | Type `lisa nandy` | Person mode — her card, party context, voting timeline |
| 5 | Click any card | Detail panel: full timeline, photo, bio, links |

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11, FastAPI, Anthropic SDK, pydantic |
| Frontend | React 18 + Vite, plain CSS, Leaflet |
| LLM | `claude-sonnet-4-6` with prompt caching |
| Data | ONS GeoJSON, official 2024 manifesto PDFs, Democracy Club |

No database. No vector store. No embeddings. Manifestos sit in the Claude system prompt with `cache_control: ephemeral`.

---

## Quick start

**Prerequisites:** Python 3.11+, Node 20+, an Anthropic API key.

```bash
git clone https://github.com/Abdulla-AlBassam/lean-in
cd lean-in
```

**Backend** (Terminal 1):
```bash
cd backend
python3.11 -m venv .venv

# Mac/Linux
source .venv/bin/activate

# Windows
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env          # then add your key: ANTHROPIC_API_KEY_1=sk-ant-...
uvicorn app.main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

Verify: `curl http://localhost:8000/api/health` → `{"status":"ok"}`

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY_1` | Yes | Anthropic API key. Add more as `_2`, `_3` — the backend round-robins across all of them. |
| `DEMO_MODE` | No | Set to `true` to serve all responses from `backend/demo_cache/` without hitting the API. |

---

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Liveness check |
| `GET /api/search?q=&nation=` | Topic search or person search. `nation` = `UK` \| `ENG` \| `SCO` \| `WAL` |
| `GET /api/person/{id}` | Full MP profile + timeline |
| `GET /api/axes` | Political axis definitions with party positions |

Full request/response shapes in [`contracts.md`](contracts.md).

---

## Bias defence

Every quote shown in the UI is a verbatim substring of the manifesto file in this repo. The topic classifier is deterministic keyword matching — no LLM involved. The LLM only summarises and extracts; it cannot invent positions because it only sees the text we pass it. If a party's manifesto is silent on a topic, the response says so plainly.

---

## Project structure

```
/
├── backend/
│   ├── app/
│   │   ├── main.py        routes + person detection
│   │   ├── search.py      LLM call, page extraction, demo cache
│   │   ├── classify.py    deterministic keyword → axis (no LLM)
│   │   ├── data.py        people.json + results.json loaders
│   │   ├── llm.py         Anthropic client, key round-robin
│   │   └── models.py      pydantic schemas
│   ├── data/
│   │   ├── manifestos/    labour.md, conservative.md, libdem.md, snp.md, plaid.md
│   │   ├── axes.json      6 axes × 5 parties — verbatim quotes + compass positions
│   │   ├── results.json   timeline entries by topic and by person
│   │   └── people.json    3 demo MP profiles
│   └── demo_cache/        15 pre-warmed responses for offline demo
└── frontend/
    ├── src/
    │   ├── App.jsx         root layout + search state
    │   ├── Map.jsx         Leaflet 4-nation interactive map
    │   ├── PartyCard.jsx   topic card + person empty card
    │   ├── DetailPanel.jsx right panel — timeline + person profile
    │   ├── api.js          backend fetch + mock toggle
    │   └── styles.css      glass aesthetic
    └── public/
        └── uk-nations.geojson   ONS 4-nation boundaries
```

---

## Data sources

| Source | Licence | Used for |
|--------|---------|----------|
| 2024 UK party manifestos (Labour, Conservative, Lib Dem, SNP, Plaid Cymru) | Public political content | Manifesto text, verbatim citations |
| [ONS Open Geography Portal](https://geoportal.statistics.gov.uk/) | Open Government Licence | UK nations GeoJSON |
| [Democracy Club](https://democracyclub.org.uk/) | CC BY 4.0 | MP profiles, candidate data |
| [UK Parliament](https://members.parliament.uk/) | Open Parliament Licence | Constituency election results |

---

## Team

| Builder | Role |
|---------|------|
| Saliha ([@saliha006](https://github.com/saliha006)) | Backend — FastAPI, LLM integration, demo cache |
| Abdulla ([@Abdulla-AlBassam](https://github.com/Abdulla-AlBassam)) | Frontend — React, Leaflet map, UI |
| Elya ([@ElyaRaza](https://github.com/ElyaRaza)) | LLM prompts — citation quality, extraction, prompt caching |
| Maks ([@maksymkhomitskyi](https://github.com/maksymkhomitskyi)) | Data — manifestos, axes, MP profiles, demo script |
| Aws ([@awszaman](https://github.com/awszaman)) | Floater — paired across all lanes |
