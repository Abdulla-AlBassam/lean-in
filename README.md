# Lean In

UK politics, plainly. Search any topic, see where every party stands. Every claim is a quote from the party's own manifesto.

- **Production:** https://lean-in-ten.vercel.app
- **Repo:** https://github.com/Abdulla-AlBassam/lean-in
- **Hackathon deadline:** end of day tomorrow

## Quick start

```bash
git clone https://github.com/Abdulla-AlBassam/lean-in
cd lean-in
npm install
npm run dev
```

Open http://localhost:3000.

You will need the `ANTHROPIC_API_KEY` env var. Ask Abdulla for `.env.local` (do not commit it). Or pull from Vercel if you have access:

```bash
npx vercel link    # link to lean-in
npx vercel env pull .env.local
```

## How we work in one repo (read this)

- **Branches per person.** `f1-frontend`, `b1-rag`, `b2-infra`, `j1-content`, `j2-viz`. Push often, merge to `main` whenever your slice works.
- **No PR reviews.** It's 24h. Just merge.
- **Vercel auto-deploys** `main` to production and every branch to a preview URL. Watch `#deploys` in our chat.
- **One person owns each file or directory.** If you need a change in someone else's, ping them — don't edit directly. The conflict-prone file is `app/page.tsx` (F1 owns).

### File ownership

| Path | Owner | Role |
|---|---|---|
| `app/page.tsx`, `components/{search,map,cards,ui}/`, layout | F1 — frontend | Search bar, UK map (4 nations as inline SVG paths, NI greyed), party cards, page state |
| `app/api/search/route.ts`, `lib/{rag,llm}/` | B1 — backend / LLM | Loads manifestos, calls Claude with prompt-cached context, returns party POVs with citations |
| `app/api/classify/route.ts`, `lib/{db,cache}/`, infra config | B2 — backend / classifier | Query → axis classifier, off-topic detection, response cache (Vercel KV if needed), helps F1 |
| `data/manifestos/*.md`, `data/axes.json`, `data/demo-queries.json` | J1 — content / demo | Manifesto cleaning, axis pre-coding (24 cells with quotes), demo script, query QA, dry runs |
| `components/spectrum/`, design polish, `tailwind.config.ts` | J2 — viz / design / float | Spectrum chart (Recharts), design pass, helps F1 with map polish, fills wherever blocked |

### Branch naming

```bash
git checkout -b f1-frontend       # F1
git checkout -b b1-rag            # B1
git checkout -b b2-infra          # B2
git checkout -b j1-content        # J1
git checkout -b j2-viz            # J2
```

## Architecture (decided)

- **Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript**
- **No database.** All 4 manifestos live in `data/manifestos/*.md` and are loaded into the Claude system prompt with **prompt caching** (90% cost discount on cached tokens). Citations are guaranteed real because the model sees the full manifesto, not retrieval chunks.
- **LLM:** Claude Sonnet 4.6 (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`. Fast enough for live demo, 5x cheaper than Opus.
- **Map:** four inline SVG paths (England/Scotland/Wales/NI). NI is greyed out with a tooltip — different party system, not in scope.
- **Spectrum:** Recharts 2D scatter. Per-axis party positions are hand-coded in `data/axes.json` with justifying quotes and source citations.
- **Deploy:** Vercel, auto on push to `main`.

### API contracts (already stubbed, return 501)

```
POST /api/search
  body:  { query: string, nation: "UK"|"ENG"|"SCO"|"WAL"|"NIR" }
  200:   { axisId: string, parties: Array<{ id, name, summary, citations: [{ quote, source }] }> }

POST /api/classify
  body:  { query: string }
  200:   { axisId: string, confidence: number, isOnTopic: boolean }
```

F1 can wire against these shapes immediately — they return `501 not implemented` until B1/B2 ship.

## Demo flow (locked, build backwards from this)

1. Page loads — UK map centred, search bar with cycling placeholder ("tuition fees", "NHS waiting times", ...)
2. User types `tuition fees` — three party cards appear (Lab, Con, LD) with cited quotes; spectrum below
3. User clicks **Scotland** on the map — same query re-runs, **SNP** card joins, spectrum updates
4. User clears, types `renters rights` — content updates fluidly
5. Tagline: *"One search bar. Every party. Real quotes. Your country."*

If a feature doesn't serve this script, don't build it.

## Bias defence (you will be asked)

> "Every claim is a direct quote from the party's own manifesto, linked inline. We summarise tone, never invent positions. The spectrum is hand-coded from manifesto quotes, not LLM-guessed."

Citations are in the UI from the start — do not retrofit at hour 20.

## Risks

1. **Demo wifi dies** — record a 2-min backup screen capture at H22.
2. **API rate limit during demo** — prompt caching is mandatory, pre-warm the 5 demo queries before judging.
3. **Bad LLM output on weird query phrasings** — J1 owns QA across 20+ phrasings before demo.

## Stack

- `next@16.2.4`, `react@19`, Tailwind v4, TypeScript
- `@anthropic-ai/sdk` for Claude
- `recharts` for the spectrum chart
- `zod` for input validation
- `pg` + `pgvector` installed but unused (kept as escape hatch if architecture changes)
