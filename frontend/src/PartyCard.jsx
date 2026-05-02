import { PartyEmblem } from "./PartyEmblem.jsx";

export function PartyCard({ party, onClick, active }) {
  if (party.empty) {
    return (
      <article
        className="party-card party-card--empty"
        style={{ "--party-colour": party.colour }}
        aria-disabled="true"
      >
        <header>
          <PartyEmblem partyId={party.id} size={28} />
          <h2>{party.name}</h2>
        </header>
        <p className="empty-text">No record</p>
      </article>
    );
  }
  return (
    <article
      className={`party-card ${active ? "party-card--active" : ""}`}
      style={{ "--party-colour": party.colour }}
      onClick={() => onClick && onClick(party)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick(party);
        }
      }}
    >
      <header>
        <PartyEmblem partyId={party.id} size={28} />
        <h2>{party.name}</h2>
      </header>
      <p className="summary">{party.person_summary || party.summary}</p>
      {(party.citations || []).slice(0, 1).map((c, i) => (
        <div key={i} className="citation">
          <blockquote>"{c.quote}"</blockquote>
          <cite>{c.source}</cite>
        </div>
      ))}
    </article>
  );
}
