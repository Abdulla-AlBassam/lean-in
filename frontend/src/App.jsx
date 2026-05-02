import { useState } from "react";
import { Map } from "./Map.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { PartyCard } from "./PartyCard.jsx";
import { SpectrumChart } from "./SpectrumChart.jsx";
import { Logo } from "./Logo.jsx";
import { search } from "./api.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [nation, setNation] = useState("UK");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minimised, setMinimised] = useState(false);

  async function runSearch(q, n) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await search(q, n);
      setResults(data);
      setMinimised(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNationSelect(n) {
    setNation(n);
    if (results && query) runSearch(query, n);
  }

  return (
    <div className="app">
      <Map nation={nation} onSelect={handleNationSelect} />

      <div className="overlay">
        <Logo />
        <SearchBar
          query={query}
          onChange={setQuery}
          onSubmit={() => runSearch(query, nation)}
        />

        {loading && <div className="status">Loading…</div>}
        {error && <div className="status error">{error}</div>}

        {results && !loading && (
          <div className={`results ${minimised ? "minimised" : ""}`}>
            <button
              className="results-toggle"
              onClick={() => setMinimised((m) => !m)}
              aria-label={minimised ? "Expand results" : "Minimise results"}
              aria-expanded={!minimised}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <SpectrumChart axis={results.axisLabel} parties={results.parties} />
            {!minimised && (
              <div className="cards">
                {results.parties.map((p) => (
                  <PartyCard key={p.id} party={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
