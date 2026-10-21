import styles from "./Diagram.module.css";

const nodes = [
  { x: 20, label: "Stripe", sub: "subscription events" },
  { x: 205, label: "API Gateway", sub: "webhook endpoint" },
  { x: 390, label: "Lambda", sub: "verify · handle event" },
  { x: 575, label: "DynamoDB", sub: "billing state" },
];

/** Generic webhook-driven billing flow on serverless AWS. Not the client's actual code. */
export function BillingFlowDiagram() {
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 760 220" className={styles.svg} role="img" aria-labelledby="bill-title bill-desc">
        <title id="bill-title">Webhook-driven billing flow</title>
        <desc id="bill-desc">
          Stripe sends subscription events to a webhook endpoint on API Gateway. A Lambda function handles each event
          and updates billing state in DynamoDB, which the student and instructor dashboards read.
        </desc>
        <defs>
          <marker id="bill-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className={styles.arrowHead} />
          </marker>
        </defs>

        {nodes.map((n, i) => (
          <g key={n.label}>
            <rect x={n.x} y="30" width="165" height="72" rx="12" className={i === 2 ? styles.boxAccent : styles.box} />
            <text x={n.x + 82.5} y="62" textAnchor="middle" className={i === 2 ? styles.labelAccent : styles.label}>
              {n.label}
            </text>
            <text x={n.x + 82.5} y="84" textAnchor="middle" className={styles.sub}>
              {n.sub}
            </text>
            {i < nodes.length - 1 && (
              <path d={`M${n.x + 165} 66 H${n.x + 203}`} className={styles.line} markerEnd="url(#bill-arrow)" />
            )}
          </g>
        ))}

        <path d="M657 102 V160 H460" className={styles.lineDashed} markerEnd="url(#bill-arrow)" />
        <rect x="200" y="135" width="258" height="56" rx="12" className={styles.box} />
        <text x="329" y="160" textAnchor="middle" className={styles.label}>
          Next.js dashboards
        </text>
        <text x="329" y="179" textAnchor="middle" className={styles.sub}>
          plan status · invoices
        </text>
      </svg>
      <figcaption className={styles.caption}>
        Simplified illustration of the pattern, not the client&apos;s actual code or infrastructure.
      </figcaption>
    </figure>
  );
}
