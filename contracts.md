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

All files committed to `main`.

### `frontend/public/uk-nations.geojson`
**Status:** ✅ done — on main
**What it is:** UK 4-nation boundary map file. Builder B (Abdulla) needs this for the map to render.
**Property field:** `CTRY23CD` — Map.jsx already handles this with its `CTRY24CD || CTRY23CD` fallback.
**Source:** ONS Countries (December 2023) Boundaries UK BUC via ArcGIS FeatureServer.
Nations: E92000001 England, S92000003 Scotland, W92000004 Wales, N92000002 Northern Ireland.

---

### `backend/data/manifestos/labour.md`
**Status:** ✅ done — on main
**What it is:** Full 2024 Labour General Election manifesto as plain text, 132 pages, 193 KB.
Page markers format: `(p.N)` — e.g. `(p.34)` before every page of content.
Source: official PDF from labour.org.uk

### `backend/data/manifestos/conservative.md`
**Status:** ✅ done — on main
**What it is:** Full 2024 Conservative General Election manifesto as plain text, 77 pages, 200 KB.
Page markers format: `(p.N)`.
Source: official PDF from conservatives.com

### `backend/data/manifestos/libdem.md`
**Status:** ✅ done — on main
**What it is:** Full 2024 Liberal Democrat General Election manifesto as plain text, 116 pages, 153 KB.
Page markers format: `(p.N)`.
Source: official PDF from libdems.org.uk

### `backend/data/manifestos/snp.md`
**Status:** ✅ done — on main
**What it is:** Full 2024 SNP General Election manifesto as plain text, 31 pages, 61 KB.
Page markers format: `(p.N)`.
Source: official PDF from snp.org

---

### `backend/data/axes.json`
**Status:** ✅ done — on main, all 24 cells filled, no TODOs remaining
**What it is:** 6 axes × 4 parties = 24 cells. Each cell has a verbatim quote, page citation, and (x, y) position score.
`x` ∈ [-1, 1]: economic (left = negative, right = positive).
`y` ∈ [-1, 1]: social (libertarian = positive, authoritarian = negative).
Axes: `economy`, `health`, `education`, `housing`, `immigration`, `environment`.
Parties: `labour`, `conservative`, `libdem`, `snp`.
Every quote sourced directly from the manifesto files above.

---

### `backend/data/results.json`
**Status:** ✅ done — on main
**What it is:** Evidence entries for the detail modal. Two sections: `by_topic` (6 topics × 4 parties, 3–5 entries each) and `by_person` (3 demo MPs, 3 entries each).
Sources: official 2024 GE manifesto PDFs + Hansard parliamentary speech pages (downloaded 2 May 2026).
Shape:
```json
{
  "_owner": "builder-d",
  "by_person": {
    "<person_id>": [
      { "type": "statement|vote|press|manifesto", "date": "YYYY-MM-DD", "headline": "≤80 chars", "quote": "verbatim", "source_label": "human-readable", "source_url": "https://..." }
    ]
  },
  "by_topic": {
    "<topic_id>": {
      "<party_id>": [
        { "date": "YYYY-MM-DD", "headline": "≤80 chars", "quote": "verbatim ≤300 chars", "source_label": "human-readable", "source_url": "https://..." }
      ]
    }
  }
}
```
Topic IDs: `economy`, `health`, `education`, `housing`, `immigration`, `environment`.
Party IDs: `labour`, `conservative`, `libdem`, `snp`.
Person IDs: `lisa-nandy`, `robert-jenrick`, `daisy-cooper`.
**Needs from Builder A:** Endpoint to serve results — either `GET /api/results?topic=<id>&party=<id>` and `GET /api/results?person=<id>`, or attach `results` array to existing `/api/search` and `/api/person/{id}` responses.

---

### `backend/data/people.json`
**Status:** ✅ done — on main
**What it is:** 3 demo MP profiles for person search (Lisa Nandy/Labour, Robert Jenrick/Conservative, Daisy Cooper/LibDem).
Each has: `id`, `name`, `aliases` (search terms), `party_id`, `constituency`, `role`, `photo_url` (Wikimedia Commons CC), `bio`, `links` (Wikipedia + Parliament + TheyWorkForYou), `person_summary`, `citations`.
Results timelines for each person live in `results.json` under `by_person`.
Shape:
```json
{
  "_owner": "builder-d",
  "people": {
    "<person_id>": {
      "id": "lisa-nandy",
      "name": "Lisa Nandy",
      "aliases": ["nandy", "lisa nandy"],
      "party_id": "labour",
      "constituency": "Wigan",
      "role": "Secretary of State for Culture, Media and Sport",
      "photo_url": "https://upload.wikimedia.org/...",
      "bio": "...",
      "links": [{ "label": "Wikipedia", "url": "..." }, { "label": "Parliament profile", "url": "..." }, { "label": "TheyWorkForYou", "url": "..." }],
      "person_summary": "...",
      "citations": [{ "quote": "...", "source": "..." }]
    }
  }
}
```
**Needs from Builder A:** `GET /api/person/{id}` should read this file to populate person metadata, then merge in `results.json.by_person[id]` for the timeline.

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
