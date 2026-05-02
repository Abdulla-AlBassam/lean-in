import { useEffect, useState } from "react";
import { PartyEmblem } from "./PartyEmblem.jsx";
import { PersonProfile } from "./PersonProfile.jsx";
import { getPartyMps, getMp, getMpTopicPositions, getArticles } from "./api.js";

const TYPE_LABEL = {
  manifesto: "Manifesto",
  statement: "Statement",
  vote: "Vote",
  press: "Press release",
  news: "News",
};

export function DetailPanel({ open, mode, party, person, topic, axisId, results, onClose }) {
  const [tab, setTab] = useState("manifesto");
  const [drilledMp, setDrilledMp] = useState(null);

  useEffect(() => {
    if (!open) {
      setTab("manifesto");
      setDrilledMp(null);
    }
  }, [open]);

  useEffect(() => {
    setDrilledMp(null);
    setTab("manifesto");
  }, [party?.id, person?.id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (drilledMp) {
        setDrilledMp(null);
      } else {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, drilledMp, onClose]);

  return (
    <aside
      className={`detail-panel ${open ? "detail-panel--open" : ""}`}
      aria-hidden={!open}
    >
      {drilledMp ? (
        <MpDetail mp={drilledMp} axisId={axisId} topic={topic} onBack={() => setDrilledMp(null)} onClose={onClose} />
      ) : mode === "person" && person ? (
        <PersonView person={person} onClose={onClose} />
      ) : party ? (
        <PartyView
          party={party}
          axisId={axisId}
          topic={topic}
          tab={tab}
          setTab={setTab}
          onMpClick={(mpId) => setDrilledMp(mpId)}
          onClose={onClose}
        />
      ) : null}
    </aside>
  );
}

function PartyView({ party, axisId, topic, tab, setTab, onMpClick, onClose }) {
  const manifestoEntries = (party.results || []).filter((r) => r.type === "manifesto");
  const articles = getArticles(axisId, party.id);
  const mps = getPartyMps(party.id);

  return (
    <>
      <header className="detail-panel__header">
        <div className="detail-panel__title">
          <PartyEmblem partyId={party.id} size={36} />
          <div>
            <h2>{party.name}</h2>
            <p className="detail-panel__sub">{topic}</p>
          </div>
        </div>
        <CloseButton onClick={onClose} />
      </header>

      <div className="tabstrip" role="tablist">
        <TabBtn active={tab === "manifesto"} onClick={() => setTab("manifesto")}>Manifesto</TabBtn>
        <TabBtn active={tab === "articles"} onClick={() => setTab("articles")}>Articles</TabBtn>
        <TabBtn active={tab === "mps"} onClick={() => setTab("mps")}>MPs</TabBtn>
      </div>

      <div className="detail-panel__body">
        {tab === "manifesto" && <Timeline entries={manifestoEntries} emptyText="No manifesto entry on this topic." />}
        {tab === "articles" && <ArticlesList articles={articles} />}
        {tab === "mps" && <MpsList mps={mps} onClick={onMpClick} />}
      </div>
    </>
  );
}

function PersonView({ person, onClose }) {
  return (
    <>
      <header className="detail-panel__header">
        <div className="detail-panel__title">
          <PartyEmblem partyId={person.party_id} size={36} />
          <div>
            <h2>{person.name}</h2>
            <p className="detail-panel__sub">Recent record</p>
          </div>
        </div>
        <CloseButton onClick={onClose} />
      </header>
      <div className="detail-panel__body">
        <PersonProfile person={person} />
        <Timeline entries={person.results || []} emptyText="No additional results yet." />
      </div>
    </>
  );
}

function MpDetail({ mp: mpId, axisId, topic, onBack, onClose }) {
  const mp = getMp(mpId) || stubMp(mpId);
  const positions = getMpTopicPositions(mpId, axisId);

  return (
    <>
      <header className="detail-panel__header">
        <button className="back-btn" onClick={onBack} aria-label="Back to party detail">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back</span>
        </button>
        <CloseButton onClick={onClose} />
      </header>
      <div className="detail-panel__body">
        <PersonProfile person={mp} />
        <p className="section-eyebrow">{mp.name.split(" ")[0]}'s positions on {topic}</p>
        <Timeline entries={positions} emptyText={`No public record from ${mp.name} on this topic yet.`} />
      </div>
    </>
  );
}

function stubMp(mpId) {
  return {
    id: mpId,
    name: mpId.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" "),
    role: "Member of Parliament",
    constituency: "—",
    bio: "Profile data not yet available for this MP.",
    links: [],
  };
}

function Timeline({ entries, emptyText }) {
  if (!entries || entries.length === 0) {
    return <p className="detail-panel__empty">{emptyText}</p>;
  }
  return (
    <ol className="timeline">
      {entries.map((r, i) => (
        <li key={i} className="timeline-entry">
          <div className="timeline-meta">
            <span className="type-chip">{TYPE_LABEL[r.type] || r.type}</span>
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
  );
}

function ArticlesList({ articles }) {
  if (articles.length === 0) {
    return <p className="detail-panel__empty">No articles found for this party on this topic.</p>;
  }
  return (
    <ol className="article-list">
      {articles.map((a, i) => (
        <li key={i} className="article-card">
          <div className="article-meta">
            <span className="article-source">{a.source}</span>
            <time dateTime={a.date}>{formatDate(a.date)}</time>
          </div>
          <h3 className="article-headline">{a.headline}</h3>
          <p className="article-excerpt">{a.excerpt}</p>
          <a className="article-source-link" href={a.url} target="_blank" rel="noopener noreferrer">
            Read on {a.source} <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

function MpsList({ mps, onClick }) {
  if (mps.length === 0) {
    return <p className="detail-panel__empty">No MPs listed for this party.</p>;
  }
  return (
    <ul className="mp-list">
      {mps.map((mp) => (
        <li key={mp.id}>
          <button className="mp-row" onClick={() => onClick(mp.id)}>
            <div className="mp-row__main">
              <span className="mp-row__name">{mp.name}</span>
              <span className="mp-row__constituency">{mp.constituency}</span>
            </div>
            <span className="mp-row__role">{mp.role}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      className={`tab-btn ${active ? "tab-btn--active" : ""}`}
      onClick={onClick}
      role="tab"
      aria-selected={active}
    >
      {children}
    </button>
  );
}

function CloseButton({ onClick }) {
  return (
    <button className="detail-panel__close" onClick={onClick} aria-label="Close detail panel">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M4 4l8 8 M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
