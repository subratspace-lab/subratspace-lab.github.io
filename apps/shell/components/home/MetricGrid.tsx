import type { Metric } from "@skj/content";
import { CountUp } from "../motion/CountUp";
import styles from "./Home.module.css";

export function MetricGrid({ items, label = "Headline results" }: { items: readonly Metric[]; label?: string }) {
  return (
    <ul className={styles.metrics} aria-label={label}>
      {items.map((m) => (
        <li key={m.id} className={styles.metric}>
          <span className={styles.metricValue}>
            <CountUp text={m.display} />
          </span>
          <span className={styles.metricLabel}>{m.label}</span>
          <span className={styles.metricContext}>{m.context}</span>
        </li>
      ))}
    </ul>
  );
}
