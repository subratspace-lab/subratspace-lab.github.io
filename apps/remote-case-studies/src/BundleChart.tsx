import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BundleChartProps, BundleChunk } from "@skj/contracts";
import { IllustrativeBadge } from "./IllustrativeBadge";
import { useCssVars, usePrefersReducedMotion } from "./useCssVars";
import styles from "./BundleChart.module.css";

const TOKENS = ["chart-before", "chart-after", "chart-grid", "chart-axis", "fg", "fg-muted"] as const;
const FALLBACK = {
  "chart-before": "#c2410c",
  "chart-after": "#0d9488",
  "chart-grid": "#e7e5e4",
  "chart-axis": "#6b6560",
  fg: "#1c1917",
  "fg-muted": "#57534e",
};

const kb = (n: number) => `${n.toLocaleString("en-US")} KB`;

type TooltipPayload = { payload: BundleChunk };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const chunk = payload?.[0]?.payload;
  if (!active || !chunk) return null;
  const pct = Math.round((1 - chunk.afterKb / chunk.beforeKb) * 100);
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{chunk.label}</p>
      <p>
        <span className={styles.swatch} data-series="before" /> Before <strong>{kb(chunk.beforeKb)}</strong>
      </p>
      <p>
        <span className={styles.swatch} data-series="after" /> After <strong>{kb(chunk.afterKb)}</strong>
      </p>
      <p className={styles.tooltipDelta}>−{pct}%</p>
    </div>
  );
}

export default function BundleChart({ data }: BundleChartProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const colors = useCssVars(TOKENS, FALLBACK);
  const reduceMotion = usePrefersReducedMotion();
  const tableId = useId();

  const before = data.chunks.reduce((s, c) => s + c.beforeKb, 0);
  const after = data.chunks.reduce((s, c) => s + c.afterKb, 0);
  const reduction = Math.round((1 - after / before) * 100);
  const height = data.chunks.length * 56 + 60;

  return (
    <figure className={styles.root}>
      <div className={styles.header}>
        <div>
          <figcaption className={styles.caption}>Bundle size by chunk, {data.unit}</figcaption>
          <p className={styles.total}>
            <span>{kb(before)}</span>
            <span aria-hidden="true"> → </span>
            <span className="visually-hidden"> to </span>
            <span>{kb(after)}</span>
            <span className={styles.totalDelta}> (−{reduction}%)</span>
          </p>
        </div>
        <div className={styles.controls}>
          <IllustrativeBadge>Illustrative data</IllustrativeBadge>
          <div className={styles.viewToggle} role="group" aria-label="View as">
            <button type="button" aria-pressed={view === "chart"} onClick={() => setView("chart")}>
              Chart
            </button>
            <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} aria-controls={tableId}>
              Table
            </button>
          </div>
        </div>
      </div>

      {view === "chart" ? (
        <div className={styles.chart} style={{ height }} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer={false} data={data.chunks} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }} barGap={2} barCategoryGap="28%">
              <CartesianGrid horizontal={false} stroke={colors["chart-grid"]} />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${v}`}
                tick={{ fill: colors["chart-axis"], fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit=" KB"
              />
              <YAxis
                type="category"
                dataKey="label"
                width={118}
                tick={{ fill: colors.fg, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: colors["chart-grid"], fillOpacity: 0.5 }} />
              <Legend
                verticalAlign="top"
                align="left"
                height={32}
                iconType="circle"
                itemSorter={null}
                iconSize={8}
                formatter={(value: string) => <span style={{ color: colors["fg-muted"], fontSize: 13 }}>{value}</span>}
              />
              <Bar dataKey="beforeKb" name="Before" fill={colors["chart-before"]} radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion} />
              <Bar dataKey="afterKb" name="After" fill={colors["chart-after"]} radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion} animationBegin={150} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* The table is always in the DOM for screen readers; visible when "Table" is chosen. */}
      <div id={tableId} className={view === "table" ? styles.tableWrap : "visually-hidden"}>
      <table className={styles.table}>
        <caption className="visually-hidden">Bundle size by chunk, before and after (illustrative)</caption>
        <thead>
          <tr>
            <th scope="col">Chunk</th>
            <th scope="col">Before</th>
            <th scope="col">After</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          {data.chunks.map((c) => (
            <tr key={c.id}>
              <th scope="row">{c.label}</th>
              <td>{kb(c.beforeKb)}</td>
              <td>{kb(c.afterKb)}</td>
              <td>−{Math.round((1 - c.afterKb / c.beforeKb) * 100)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td>{kb(before)}</td>
            <td>{kb(after)}</td>
            <td>−{reduction}%</td>
          </tr>
        </tfoot>
      </table>
      </div>
    </figure>
  );
}
