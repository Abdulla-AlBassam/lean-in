// Stub. Will render a 2D scatter (economic x social) of the parties on the
// active axis. Recharts or plain SVG. See data/axes.json for shape.
export function SpectrumChart({ axis, parties }) {
  return (
    <div className="spectrum">
      <div className="spectrum-label">{axis}</div>
      <div className="spectrum-mock">
        {parties.map((p) => (
          <span key={p.id} className="dot" style={{ "--dot-colour": p.colour + "55" }}>
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
