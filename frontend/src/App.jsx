import { useState } from "react";
import { Map } from "./Map.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { PartyCard } from "./PartyCard.jsx";
import { Logo } from "./Logo.jsx";
import { DetailPanel } from "./DetailPanel.jsx";
import { search } from "./api.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [nation, setNation] = useState("UK");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  async function runSearch(q, n) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedParty(null);
    try {
      const data = await search(q, n);
      setResults(data);
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

  function handleCardClick(party) {
    setSelectedParty(party);
  }

  function clearAll() {
    setResults(null);
    setQuery("");
    setSelectedParty(null);
    setError(null);
  }

  const isPerson = results?.query_type === "person";
  const detailMode = isPerson ? "person" : "topic";
  const detailResults = isPerson
    ? results?.person?.results || []
    : selectedParty?.results || [];
  const detailTopic = isPerson
    ? results?.parties?.find((p) => !p.empty)?.name
    : results?.axisLabel;

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <div className="topbar__search">
          <SearchBar
            query={query}
            onChange={setQuery}
            onSubmit={() => runSearch(query, nation)}
          />
        </div>
      </header>

      <div className={`stage ${results ? "stage--with-rail" : ""} ${selectedParty ? "stage--with-panel" : ""}`}>
        <aside className="cards-rail" aria-hidden={!results}>
          <div className="cards-rail__inner">
            {error && <div className="rail-status rail-status--error">{error}</div>}
            {loading && <div className="rail-status">Loading…</div>}
            {results && !loading && (
              <>
                <div className="rail-header">
                  <span className="rail-eyebrow">
                    {isPerson ? "Person" : results.axisLabel}
                  </span>
                  <button className="rail-clear" onClick={clearAll} aria-label="Clear search">
                    <svg viewBox="0 0 16 16" width="12" height="12">
                      <path d="M4 4l8 8 M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="rail-cards">
                  {results.parties.map((p) => (
                    <PartyCard
                      key={p.id}
                      party={p}
                      onClick={p.empty ? undefined : handleCardClick}
                      active={selectedParty?.id === p.id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="map-region">
          <Map nation={nation} onSelect={handleNationSelect} />
        </div>

        <DetailPanel
          open={!!selectedParty}
          mode={detailMode}
          party={selectedParty}
          person={isPerson ? results?.person : null}
          topic={detailTopic}
          results={detailResults}
          onClose={() => setSelectedParty(null)}
        />
      </div>
    </div>
  );
}
