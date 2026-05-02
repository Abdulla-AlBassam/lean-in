import { useState } from "react";
import { Map } from "./Map.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { PartyCard } from "./PartyCard.jsx";
import { Logo } from "./Logo.jsx";
import { DetailModal } from "./DetailModal.jsx";
import { LoadingSkeleton } from "./LoadingSkeleton.jsx";
import { search } from "./api.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [nation, setNation] = useState("UK");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minimised, setMinimised] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);

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

  function dismissResults() {
    setResults(null);
    setQuery("");
    setMinimised(false);
    setError(null);
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

        {loading && <LoadingSkeleton />}
        {error && <div className="status error">{error}</div>}

        {results && !loading && (
          <div className={`results ${minimised ? "minimised" : ""}`}>
            <div className="results-actions">
              <button
                className="results-pill"
                onClick={() => setMinimised((m) => !m)}
                aria-label={minimised ? "Expand results" : "Minimise results"}
                aria-expanded={!minimised}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="results-pill"
                onClick={dismissResults}
                aria-label="Close results"
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M4 4l8 8 M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {!minimised && (
              <div className="cards">
                {results.parties.map((p) => (
                  <PartyCard key={p.id} party={p} onClick={setSelectedParty} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedParty && results && (
        <DetailModal
          party={selectedParty}
          topic={results.axisLabel}
          onClose={() => setSelectedParty(null)}
        />
      )}
    </div>
  );
}
