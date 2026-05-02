export function LoadingSkeleton() {
  return (
    <div
      className="skeleton-panel"
      role="status"
      aria-live="polite"
      aria-label="Loading party positions"
    >
      <div className="skeleton-cards">
        {[0, 1, 2].map((i) => (
          <article key={i} className="skeleton-card" aria-hidden="true">
            <header className="skeleton-card-header">
              <span className="skeleton-shimmer skeleton-emblem" />
              <span className="skeleton-shimmer skeleton-name" />
            </header>
            <span className="skeleton-shimmer skeleton-line" />
            <span className="skeleton-shimmer skeleton-line skeleton-line-short" />
            <div className="skeleton-quote">
              <span className="skeleton-shimmer skeleton-line" />
              <span className="skeleton-shimmer skeleton-line skeleton-line-mid" />
            </div>
            <span className="skeleton-shimmer skeleton-cite" />
          </article>
        ))}
      </div>
    </div>
  );
}
