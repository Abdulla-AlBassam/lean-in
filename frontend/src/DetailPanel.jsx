import { useEffect } from "react";
import { PartyEmblem } from "./PartyEmblem.jsx";
import { PersonProfile } from "./PersonProfile.jsx";

const TYPE_LABEL = {
  manifesto: "Manifesto",
  statement: "Statement",
  vote: "Vote",
  press: "Press release",
  news: "News",
};

export function DetailPanel({ open, mode, party, person, topic, results, onClose }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <aside
      className={`detail-panel ${open ? "detail-panel--open" : ""}`}
      style={party ? { "--party-colour": party.colour } : undefined}
      aria-hidden={!open}
    >
      <header className="detail-panel__header">
        <div className="detail-panel__title">
          {mode === "person" && person ? (
            <>
              <PartyEmblem partyId={person.party_id} size={36} />
              <div>
                <h2>{person.name}</h2>
                <p className="detail-panel__sub">{topic ? `on ${topic}` : "Recent record"}</p>
              </div>
            </>
          ) : party ? (
            <>
              <PartyEmblem partyId={party.id} size={36} />
              <div>
                <h2>{party.name}</h2>
                <p className="detail-panel__sub">{topic}</p>
              </div>
            </>
          ) : null}
        </div>
        <button className="detail-panel__close" onClick={onClose} aria-label="Close detail panel">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4 4l8 8 M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="detail-panel__body">
        {mode === "person" && person && <PersonProfile person={person} />}

        {results && results.length > 0 ? (
          <ol className="timeline">
            {results.map((r, i) => (
              <li key={i} className="timeline-entry">
                <div className="timeline-meta">
                  <span className={`type-chip type-${r.type}`}>{TYPE_LABEL[r.type] || r.type}</span>
                  <time dateTime={r.date}>{formatDate(r.date)}</time>
                </div>
                <h3 className="timeline-headline">{r.headline}</h3>
                <blockquote className="timeline-quote">"{r.quote}"</blockquote>
                {r.source_url ? (
                  <a className="timeline-source" href={r.source_url} target="_blank" rel="noopener noreferrer">
                    {r.source_label} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="timeline-source">{r.source_label}</span>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="detail-panel__empty">No additional results yet.</p>
        )}
      </div>
    </aside>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
