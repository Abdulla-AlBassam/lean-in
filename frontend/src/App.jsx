import { useState } from "react";
import { Map } from "./Map.jsx";
import { SearchBar } from "./SearchBar.jsx";
import { PartyCard } from "./PartyCard.jsx";
import { SpectrumChart } from "./SpectrumChart.jsx";
import { search } from "./api.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [nation, setNation] = useState("UK");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runSearch(q, n) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
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

  return (
    <div className="app">
      <Map nation={nation} onSelect={handleNationSelect} />

      <div className="overlay">
        <SearchBar
          query={query}
          onChange={setQuery}
          onSubmit={() => runSearch(query, nation)}
        />

        {loading && <div className="status">Loading…</div>}
        {error && <div className="status error">{error}</div>}

        {results && !loading && (
          <div className="results">
            <SpectrumChart axis={results.axisLabel} parties={results.parties} />
            <div className="cards">
              {results.parties.map((p) => (
                <PartyCard key={p.id} party={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
