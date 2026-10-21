import { useId, useState, type CSSProperties } from "react";
import type { LighthouseComparison, LighthouseMetric, LighthouseSliderProps } from "@skj/contracts";
import { IllustrativeBadge } from "./IllustrativeBadge";
import styles from "./LighthouseSlider.module.css";

function formatValue(m: LighthouseMetric, v: number): string {
  if (m.unit === "ms") return `${Math.round(v)} ms`;
  if (m.unit === "s") return `${v.toFixed(1)} s`;
  return v.toFixed(2);
}

function change(m: LighthouseMetric): string {
  const pct = Math.round(((m.after - m.before) / m.before) * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function Gauge({ score, tone }: { score: number; tone: "before" | "after" }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className={styles.gauge} aria-hidden="true">
      <circle cx="50" cy="50" r={r} className={styles.gaugeTrack} />
      <circle
        cx="50"
        cy="50"
        r={r}
        className={styles.gaugeValue}
        style={{ stroke: `var(--chart-${tone})`, strokeDasharray: `${(score / 100) * c} ${c}` }}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" className={styles.gaugeText} dominantBaseline="central" textAnchor="middle">
        {score}
      </text>
    </svg>
  );
}

function Panel({ data, side }: { data: LighthouseComparison; side: "before" | "after" }) {
  const score = data.score[side];
  return (
    <div className={styles.panel} data-side={side}>
      <div className={styles.panelHead}>
        <Gauge score={score} tone={side} />
        <div>
          <p className={styles.sideLabel}>{side === "before" ? "Before" : "After"}</p>
          <p className={styles.scoreLabel}>
            Performance <strong>{score}</strong>
          </p>
        </div>
      </div>
      <dl className={styles.metrics}>
        {data.metrics.map((m) => (
          <div key={m.id} className={styles.metricRow}>
            <dt>{m.label}</dt>
            <dd>
              {formatValue(m, m[side])}
              {side === "after" && <span className={styles.delta}>{change(m)}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function LighthouseSlider({ data }: LighthouseSliderProps) {
  const [pos, setPos] = useState(50);
  const id = useId();

  return (
    <figure className={styles.root}>
      <div className={styles.header}>
        <figcaption className={styles.caption}>
          Lighthouse performance, before and after. Drag the handle or use the arrow keys.
        </figcaption>
        <IllustrativeBadge>Score verified · breakdown illustrative</IllustrativeBadge>
      </div>

      <div className={styles.stage} style={{ "--pos": `${pos}%` } as CSSProperties}>
        <div className={styles.layer} aria-label="Before optimization" role="group">
          <Panel data={data} side="before" />
        </div>
        <div className={`${styles.layer} ${styles.afterLayer}`} aria-label="After optimization" role="group">
          <Panel data={data} side="after" />
        </div>

        <input
          id={id}
          className={styles.range}
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Reveal the after-optimization results"
          aria-valuetext={`${100 - pos}% of the after view shown`}
        />
        <div className={styles.chips} aria-hidden="true">
          <span className={styles.chip} data-side="before">
            Before {data.score.before}
          </span>
          <span className={styles.chip} data-side="after">
            After {data.score.after}
          </span>
        </div>
        <div className={styles.handle} aria-hidden="true">
          <span className={styles.grip}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </figure>
  );
}
