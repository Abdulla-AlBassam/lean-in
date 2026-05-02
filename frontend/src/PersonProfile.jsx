export function PersonProfile({ person }) {
  return (
    <div className="person-profile">
      <div className="person-photo-wrap">
        {person.photo_url ? (
          <img className="person-photo" src={person.photo_url} alt={person.name} loading="lazy" />
        ) : (
          <div className="person-photo person-photo--placeholder" aria-hidden="true">{initials(person.name)}</div>
        )}
      </div>
      <div className="person-meta">
        <p className="person-role">{person.role}</p>
        <p className="person-constituency">{person.constituency}</p>
      </div>
      {person.bio && <p className="person-bio">{person.bio}</p>}
      {person.links && person.links.length > 0 && (
        <ul className="person-links">
          {person.links.map((l, i) => (
            <li key={i}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
