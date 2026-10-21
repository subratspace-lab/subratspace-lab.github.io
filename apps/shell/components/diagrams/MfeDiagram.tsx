import styles from "./Diagram.module.css";

const remotes = [
  { x: 40, name: "Course", sub: "remote · own deploy" },
  { x: 290, name: "Exam", sub: "remote · own deploy" },
  { x: 540, name: "Admin", sub: "remote · own deploy" },
];

/** Generic shape of the micro-frontend split. Not the client's actual infrastructure. */
export function MfeDiagram() {
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 760 330" className={styles.svg} role="img" aria-labelledby="mfe-title mfe-desc">
        <title id="mfe-title">Micro-frontend architecture</title>
        <desc id="mfe-desc">
          A host application loads three independently deployed remotes, Course, Exam and Admin, at runtime through
          Webpack Module Federation. Shared dependencies such as React load once.
        </desc>
        <defs>
          <marker id="mfe-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className={styles.arrowHead} />
          </marker>
        </defs>

        <rect x="230" y="20" width="300" height="78" rx="12" className={styles.boxAccent} />
        <text x="380" y="52" textAnchor="middle" className={styles.labelAccent}>
          Host shell
        </text>
        <text x="380" y="74" textAnchor="middle" className={styles.sub}>
          loads remotes at runtime
        </text>

        {remotes.map((r) => (
          <g key={r.name}>
            <path d={`M380 98 V140 H${r.x + 90} V178`} className={styles.line} markerEnd="url(#mfe-arrow)" />
            <rect x={r.x} y="180" width="180" height="72" rx="12" className={styles.box} />
            <text x={r.x + 90} y="210" textAnchor="middle" className={styles.label}>
              {r.name}
            </text>
            <text x={r.x + 90} y="232" textAnchor="middle" className={styles.sub}>
              {r.sub}
            </text>
          </g>
        ))}

        <rect x="40" y="276" width="680" height="40" rx="10" className={styles.zone} />
        <text x="380" y="301" textAnchor="middle" className={styles.sub}>
          Shared dependencies such as React load once and are reused by every remote
        </text>
      </svg>
      <figcaption className={styles.caption}>
        Simplified illustration of the pattern, not the client&apos;s actual infrastructure.
      </figcaption>
    </figure>
  );
}
