import { useEffect, useState } from "react";

const PLACEHOLDERS = [
  "tuition fees",
  "NHS waiting times",
  "renters rights",
  "immigration",
  "climate policy",
];

export function SearchBar({ query, onChange, onSubmit }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (query) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 2200);
    return () => clearInterval(t);
  }, [query]);

  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDERS[idx]}
        autoFocus
      />
    </form>
  );
}
