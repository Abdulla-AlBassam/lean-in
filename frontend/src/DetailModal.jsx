import { useEffect } from "react";
import { PartyEmblem } from "./PartyEmblem.jsx";

const TYPE_LABEL = {
  manifesto: "Manifesto",
  statement: "Statement",
  vote: "Vote",
  press: "Press release",
  news: "News",
};

export function DetailModal({ party, topic, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = party.results || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header" style={{ "--party-colour": party.colour }}>
          <div className="modal-title">
            <PartyEmblem partyId={party.id} size={40} />
            <div>
              <h2>{party.name}</h2>
              <p className="modal-topic">{topic}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close detail view">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M4 4l8 8 M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="modal-body">
          {results.length === 0 ? (
            <p className="modal-empty">
              No additional results yet for this party on this topic. The team is sourcing more.
            </p>
          ) : (
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
                    <a
                      className="timeline-source"
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.source_label} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="timeline-source">{r.source_label}</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
