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

## Builder D — Maks (maksymkhomitskyi)

All files below are on branch `builder-d`. Merge that branch into main to make them available to the team.

### `frontend/public/uk-nations.geojson`
**Status:** ✅ done — committed on builder-d
**What it is:** UK 4-nation boundary map file. Builder B (Abdulla) needs this for the map to render.
**Property field:** `CTRY23CD` — Map.jsx already handles this with its `CTRY24CD || CTRY23CD` fallback.
**Source:** ONS Countries (December 2023) Boundaries UK BUC via ArcGIS FeatureServer.
Nations: E92000001 England, S92000003 Scotland, W92000004 Wales, N92000002 Northern Ireland.

---

### `backend/data/manifestos/labour.md`
**Status:** ✅ done — committed on builder-d
**What it is:** Full 2024 Labour General Election manifesto as plain text, 132 pages, 193 KB.
Page markers format: `(p.N)` — e.g. `(p.34)` before every page of content.
Source: official PDF from labour.org.uk

### `backend/data/manifestos/conservative.md`
**Status:** ✅ done — committed on builder-d
**What it is:** Full 2024 Conservative General Election manifesto as plain text, 77 pages, 200 KB.
Page markers format: `(p.N)`.
Source: official PDF from conservatives.com

### `backend/data/manifestos/libdem.md`
**Status:** ✅ done — committed on builder-d
**What it is:** Full 2024 Liberal Democrat General Election manifesto as plain text, 116 pages, 153 KB.
Page markers format: `(p.N)`.
Source: official PDF from libdems.org.uk

### `backend/data/manifestos/snp.md`
**Status:** ✅ done — committed on builder-d
**What it is:** Full 2024 SNP General Election manifesto as plain text, 31 pages, 61 KB.
Page markers format: `(p.N)`.
Source: official PDF from snp.org

---

### `backend/data/axes.json`
**Status:** ✅ done — committed on builder-d, all 24 cells filled, no TODOs remaining
**What it is:** 6 axes × 4 parties = 24 cells. Each cell has a verbatim quote, page citation, and (x, y) position score.
`x` ∈ [-1, 1]: economic (left = negative, right = positive).
`y` ∈ [-1, 1]: social (libertarian = positive, authoritarian = negative).
Axes: `economy`, `health`, `education`, `housing`, `immigration`, `environment`.
Parties: `labour`, `conservative`, `libdem`, `snp`.
Every quote sourced directly from the manifesto files above.

---

### `backend/demo_cache/`
**Status:** 🔲 pending — blocked on Builder A backend being live
**What it is:** Pre-saved API responses for all 5 demo queries. Enables `DEMO_MODE=true` fallback if wifi/API fails during demo.
Will be populated by running all demo queries against `http://localhost:8000/api/search` with `DEMO_MODE=false`.

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
