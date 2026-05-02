# API contracts — source of truth

If a shape changes, **edit this file and ping both Builder A and Builder B in chat**. Do not change one side silently.

Backend lives at `http://localhost:8000`. Frontend dev server at `http://localhost:5173` (CORS pre-allowed).

---

## `GET /api/health`

**Response 200:**
```json
{ "status": "ok" }
```

Use to confirm the backend is running and reachable from the frontend.

---

## `GET /api/search?q=<query>&nation=<nation>`

The main endpoint. Frontend calls this when the user submits a search.

**Query params:**
- `q` — string, 1–200 chars, required
- `nation` — one of `UK`, `ENG`, `SCO`, `WAL`, `NIR`. Defaults to `UK`. `NIR` returns 400 for v1.

**Response 200:**
```json
{
  "axisId": "housing",
  "axisLabel": "Housing & Renting",
  "parties": [
    {
      "id": "labour",
      "name": "Labour",
      "colour": "#E4003B",
      "summary": "Labour proposes ending no-fault evictions and capping rent increases tied to inflation.",
      "citations": [
        {
          "quote": "We will end Section 21 no-fault evictions and introduce a national cap on rent rises.",
          "source": "Labour Manifesto 2024, p.34"
        }
      ]
    },
    {
      "id": "conservative",
      "name": "Conservative",
      "colour": "#0087DC",
      "summary": "...",
      "citations": [{ "quote": "...", "source": "Conservative Manifesto 2024, p.21" }]
    },
    {
      "id": "libdem",
      "name": "Liberal Democrats",
      "colour": "#FAA61A",
      "summary": "...",
      "citations": [{ "quote": "...", "source": "Lib Dem Manifesto 2024, p.18" }]
    }
  ]
}
```

When `nation=SCO`, an additional `snp` party appears in the array. When `nation=WAL`, an additional `plaid` party appears.

**Response 400** (off-topic query, NI requested, validation fails):
```json
{ "detail": "<short message>" }
```

**Field rules:**
- `axisId` — one of the 6 axis IDs in `backend/data/axes.json`, or `unknown` for off-topic.
- `summary` — max 400 chars, neutral language, no quoted text inline.
- `citations` — 1 or 2 entries per party. Each `quote` must be verbatim from the manifesto. Each `source` cites party + manifesto + page.
- Party `id` must be one of: `labour`, `conservative`, `libdem`, `snp`, `plaid`.

---

---

## Builder D data contracts (Maks / maksymkhomitskyi)

These are the static assets and data files Builder D owns. Shapes here are what Builder A (backend) and Builder B (frontend) must match.

### `frontend/public/uk-nations.geojson`

**Status:** ✅ done — committed on builder-d

GeoJSON FeatureCollection, 4 features (England, Scotland, Wales, Northern Ireland).
Property field: `CTRY23CD` (Map.jsx already falls back `CTRY24CD || CTRY23CD` — compatible).

```
E92000001 → England
S92000003 → Scotland
W92000004 → Wales
N92000002 → Northern Ireland
```

Source: ONS Countries (December 2023) Boundaries UK BUC via ArcGIS FeatureServer.

---

### `backend/data/manifestos/{labour,conservative,libdem,snp}.md`

**Status:** 🔲 in progress

Plain markdown, page markers preserved as `(p.N)`. One file per party.
Filenames are fixed — Builder A (`llm.py`) loads them by exact name.

| File | Party |
|---|---|
| `labour.md` | Labour |
| `conservative.md` | Conservative |
| `libdem.md` | Liberal Democrats |
| `snp.md` | SNP |

---

### `backend/data/axes.json`

**Status:** 🔲 in progress — TODOs being filled

6 axes × 4 parties = 24 cells. Each cell: `{ x, y, quote, source }`.
`x` ∈ [-1, 1]: economic (left negative). `y` ∈ [-1, 1]: social (libertarian positive).
Axis IDs: `economy`, `health`, `education`, `housing`, `immigration`, `environment`.

---

### `backend/demo_cache/`

**Status:** 🔲 pending — pre-warm after backend is live

One JSON file per query×nation combination. Populated by running all demo queries with `DEMO_MODE=false`.
`DEMO_MODE=true` in `.env` makes the backend serve from this directory instead of hitting the LLM.

---

## `GET /api/axes`

Returns the full axes definition for the spectrum chart. Optional in v1 — the frontend can render the spectrum from data inside `/api/search` responses for the active axis only.

**Response 200:**
```json
{
  "axes": [
    {
      "id": "economy",
      "label": "Economy & Tax",
      "keywords": ["tax", "economy", "income", "wages", "growth", "spending", "deficit"],
      "parties": {
        "labour":       { "x": -0.4, "y":  0.0, "quote": "...", "source": "..." },
        "conservative": { "x":  0.5, "y":  0.0, "quote": "...", "source": "..." },
        "libdem":       { "x": -0.1, "y":  0.4, "quote": "...", "source": "..." },
        "snp":          { "x": -0.3, "y":  0.2, "quote": "...", "source": "..." }
      }
    }
  ]
}
```

`x` and `y` are floats in `[-1, 1]`. `x` is economic (left negative, right positive). `y` is social (libertarian positive, authoritarian negative).
