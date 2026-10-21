import styles from "./Diagram.module.css";

const packages = [
  { x: 30, label: "@skj/content", sub: "JSON + Zod" },
  { x: 240, label: "@skj/contracts", sub: "typed module props" },
  { x: 450, label: "@skj/ui-tokens", sub: "shared CSS tokens" },
  { x: 660, label: "@skj/mf-config", sub: "webpack + MF factory" },
];

const remotes = [{ y: 274, label: "case-studies", sub: "Lighthouse slider · bundle chart" }];

const ci = ["lint", "typecheck", "unit", "build", "e2e", "deploy"];

export function SiteDiagram() {
  return (
    <figure className={styles.figure}>
      <div className={styles.scroll} tabIndex={0} role="region" aria-label="Architecture diagram, scrollable">
        <svg viewBox="0 0 880 560" className={`${styles.svg} ${styles.wide}`} role="img" aria-labelledby="site-title site-desc">
          <title id="site-title">Architecture of this site</title>
          <desc id="site-desc">
            Four shared packages feed a Next.js shell and a Module Federation remote. The shell is a static export
            that loads the remote at runtime in the browser and shares one React instance. GitHub Actions runs lint,
            typecheck, unit tests, build and end-to-end tests before deploying to a free static host.
          </desc>
          <defs>
            <marker id="site-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" className={styles.arrowHead} />
            </marker>
          </defs>

          <text x="30" y="22" className={styles.zoneLabel}>
            Shared packages (build time)
          </text>
          {packages.map((p) => (
            <g key={p.label}>
              <rect x={p.x} y="34" width="190" height="60" rx="10" className={styles.box} />
              <text x={p.x + 95} y="60" textAnchor="middle" className={styles.label}>
                {p.label}
              </text>
              <text x={p.x + 95} y="80" textAnchor="middle" className={styles.sub}>
                {p.sub}
              </text>
            </g>
          ))}

          <path d="M220 94 V130" className={styles.line} markerEnd="url(#site-arrow)" />
          <path d="M650 94 V130" className={styles.line} markerEnd="url(#site-arrow)" />

          <rect x="30" y="140" width="380" height="320" rx="14" className={styles.zone} />
          <text x="50" y="164" className={styles.zoneLabel}>
            Host
          </text>
          <rect x="60" y="180" width="320" height="110" rx="12" className={styles.boxAccent} />
          <text x="220" y="214" textAnchor="middle" className={styles.labelAccent}>
            Next.js shell (static export)
          </text>
          <text x="220" y="238" textAnchor="middle" className={styles.sub}>
            routing · SEO · content · recruiter mode
          </text>
          <text x="220" y="258" textAnchor="middle" className={styles.sub}>
            command palette · theme
          </text>
          <rect x="60" y="310" width="320" height="120" rx="12" className={styles.box} />
          <text x="220" y="342" textAnchor="middle" className={styles.label}>
            Federation runtime
          </text>
          <text x="220" y="366" textAnchor="middle" className={styles.sub}>
            loads remoteEntry.js on demand
          </text>
          <text x="220" y="386" textAnchor="middle" className={styles.sub}>
            provides React as a singleton
          </text>
          <text x="220" y="406" textAnchor="middle" className={styles.sub}>
            error boundary + retry per remote
          </text>

          <rect x="470" y="140" width="380" height="320" rx="14" className={styles.zone} />
          <text x="490" y="164" className={styles.zoneLabel}>
            Remote (built and deployed independently)
          </text>
          {remotes.map((r) => (
            <g key={r.label}>
              <path d={`M380 370 C 430 370, 440 ${r.y + 24}, 488 ${r.y + 24}`} className={styles.lineDashed} markerEnd="url(#site-arrow)" />
              <rect x="490" y={r.y} width="340" height="48" rx="10" className={styles.box} />
              <text x="510" y={r.y + 29} className={styles.label}>
                {r.label}
              </text>
              <text x="810" y={r.y + 29} textAnchor="end" className={styles.sub}>
                {r.sub}
              </text>
            </g>
          ))}

          <text x="30" y="500" className={styles.zoneLabel}>
            GitHub Actions on every push
          </text>
          {ci.map((step, i) => (
            <g key={step}>
              <rect x={30 + i * 140} y="512" width="118" height="36" rx="18" className={i === ci.length - 1 ? styles.boxAccent : styles.box} />
              <text x={89 + i * 140} y="535" textAnchor="middle" className={i === ci.length - 1 ? styles.labelAccent : styles.label}>
                {step}
              </text>
              {i < ci.length - 1 && <path d={`M${148 + i * 140} 530 H${168 + i * 140}`} className={styles.line} markerEnd="url(#site-arrow)" />}
            </g>
          ))}
        </svg>
      </div>
      <figcaption className={styles.caption}>
        Solid arrows: build-time dependencies. Dashed: runtime loading in the browser. Deploys to Vercel&apos;s free tier
        or GitHub Pages.
      </figcaption>
    </figure>
  );
}
