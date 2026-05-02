import { PartyEmblem } from "./PartyEmblem.jsx";

export function PartyCard({ party, onClick }) {
  return (
    <article
      className="party-card"
      style={{ "--party-colour": party.colour }}
      onClick={() => onClick && onClick(party)}
    >
      <header>
        <PartyEmblem partyId={party.id} size={32} />
        <h2>{party.name}</h2>
      </header>
      <p className="summary">{party.summary}</p>
      <ul className="citations">
        {party.citations.map((c, i) => (
          <li key={i}>
            <blockquote>"{c.quote}"</blockquote>
            <cite>{c.source}</cite>
          </li>
        ))}
      </ul>
    </article>
  );
}
