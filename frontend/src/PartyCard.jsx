export function PartyCard({ party }) {
  return (
    <article className="party-card" style={{ "--party-colour": party.colour }}>
      <header>
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
