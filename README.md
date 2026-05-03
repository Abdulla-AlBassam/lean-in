# Lean In

UK politics for the modern audience. 

Built at a the Claude Hackathon at Northumbria University. Designed to cut through political nonsense so voters can make more informed decisions.

---

## What it does

Open the map. Pick a nation. Type any policy topic — *renters rights*, *NHS waiting times*, *tuition fees*. Every major party's position appears as a card, each claim a direct quote from that party's 2024 General Election manifesto with a page number you can verify.

Search an MP's name instead and you get their profile: role, constituency, voting record, and where their party stands.

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
| Abdulla ([@Abdulla-AlBassam](https://github.com/Abdulla-AlBassam)) | Database & Frontend — JavaScript (React), Leaflet, UI, prompt engineering |
| Elya ([@ElyaRaza](https://github.com/ElyaRaza)) | LLM prompts — citation quality, extraction, prompt caching |
| Maks ([@maksymkhomitskyi](https://github.com/maksymkhomitskyi)) | Data — manifestos, axes, MP profiles, demo script |
| Aws ([@awszaman](https://github.com/awszaman)) | Joker — paired across all lanes |
