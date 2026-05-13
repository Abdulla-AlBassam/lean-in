import { useState } from "react";
import { Map } from "./Map.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { PartyCard } from "./PartyCard.jsx";
import { Logo } from "./Logo.jsx";
import { DetailPanel } from "./DetailPanel.jsx";
import { LoadingSkeleton } from "./LoadingSkeleton.jsx";
import { SpectrumChart } from "./SpectrumChart.jsx";
import { search } from "./api.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [nation, setNation] = useState("UK");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [constituency, setConstituency] = useState(null);

  async function runSearch(q, n) {
    if (!q.trim()) return;
    setLoading(true);
    setErrorState(null);
    setSelectedParty(null);
    try {
      const data = await search(q, n);
      setResults(data);
      if (data.query_type === "person") {
        const matched = data.parties?.find((p) => !p.empty);
        if (matched) setSelectedParty(matched);
      }
    } catch (e) {
      setResults(null);
      if (e?.status === 400) setErrorState("off-topic");
      else if (e?.status) setErrorState("api-error");
      else setErrorState("offline");
    } finally {
      setLoading(false);
    }
  }

  function handleNationSelect(n) {
    setNation(n);
    setConstituency(null);
    if (results && query) runSearch(query, n);
  }

  function handleConstituencyClick(info) {
    setConstituency(info);
    setQuery(info.mp);
    runSearch(info.mp, nation);
  }

  function handleCardClick(party) {
    setSelectedParty(party);
  }

  function clearAll() {
    setResults(null);
    setQuery("");
    setSelectedParty(null);
    setErrorState(null);
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
        <div className="topbar__search">
          <Logo />
          <SearchBar
            query={query}
            onChange={setQuery}
            onSubmit={() => runSearch(query, nation)}
          />
        </div>
      </header>

      <div className={`stage ${(results || loading || errorState) ? "stage--with-rail" : ""} ${selectedParty ? "stage--with-panel" : ""}`}>
        <aside className="cards-rail" aria-hidden={!results && !loading && !errorState}>
          <div className="cards-rail__inner">
            {loading && <LoadingSkeleton />}
            {!loading && errorState && <EmptyState kind={errorState} />}
            {!loading && !errorState && results && (
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
                {!isPerson && results.axisId && (
                  <SpectrumChart axisId={results.axisId} parties={results.parties} />
                )}
              </>
            )}
          </div>
        </aside>

        <div className="map-region">
          <Map nation={nation} onSelect={handleNationSelect} onConstituencyClick={handleConstituencyClick} selectedConstituencyCode={constituency?.code} />
        </div>

        {nation !== "UK" && nation !== "NIR" && (
          <button
            className="back-to-uk-chip"
            onClick={() => { setNation("UK"); setConstituency(null); }}
            aria-label="Back to UK overview"
          >
            <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
              <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to UK</span>
          </button>
        )}

        {constituency && (
          <div className="constituency-chip" role="status">
            <span className="constituency-chip__eyebrow" aria-hidden="true">Constituency</span>
            <span className="constituency-chip__name">{constituency.name}</span>
            <span className="constituency-chip__sep" aria-hidden="true">·</span>
            <span className="constituency-chip__mp">
              <span className="constituency-chip__dot" style={{ background: constituency.colour }} aria-hidden="true" />
              {constituency.mp}
            </span>
            <button
              className="constituency-chip__close"
              onClick={() => setConstituency(null)}
              aria-label="Clear constituency selection"
            >
              <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                <path d="M4 4l8 8 M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <DetailPanel
          open={!!selectedParty}
          mode={detailMode}
          party={selectedParty}
          person={isPerson ? results?.person : null}
          topic={detailTopic}
          axisId={results?.axisId}
          results={detailResults}
          onClose={() => setSelectedParty(null)}
        />
      </div>
    </div>
  );
}

function EmptyState({ kind }) {
  if (kind === "offline") {
    return (
      <div className="empty-state">
        <p className="empty-state__title">Lean In can't reach the backend.</p>
        <p className="empty-state__hint">Make sure the server is running on :8000.</p>
      </div>
    );
  }
  if (kind === "api-error") {
    return (
      <div className="empty-state">
        <p className="empty-state__title">Something went wrong.</p>
        <p className="empty-state__hint">Try a different query or refresh the page.</p>
      </div>
    );
  }
  return (
    <div className="empty-state">
      <p className="empty-state__title">We don't have party positions on that.</p>
      <p className="empty-state__hint">
        Try: NHS · housing · crime · immigration · climate · education · transport · welfare · defence · the economy
      </p>
    </div>
  );
}
