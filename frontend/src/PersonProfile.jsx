import { useState, useEffect } from "react";

const PlaceholderAvatar = () => (
  <div className="person-photo person-photo--placeholder" aria-hidden="true">
    <svg viewBox="0 0 64 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <circle cx="32" cy="25" r="8.5" fill="currentColor" />
      <path d="M 18 52 C 18 42, 24 36, 32 36 C 40 36, 46 42, 46 52 Z" fill="currentColor" />
    </svg>
  </div>
);

export function PersonProfile({ person }) {
  // Wikimedia URLs in people.json occasionally 404 (file renamed, cropped variant
  // missing, etc.). Without onError the browser renders alt text inside the
  // broken image box, which looks like the MP's name pasted into a circle.
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [person.photo_url]);
  const showImage = person.photo_url && !imgFailed;

  return (
    <div className="person-profile">
      <div className="person-photo-wrap">
        {showImage ? (
          <img
            className="person-photo"
            src={person.photo_url}
            alt={person.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <PlaceholderAvatar />
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
