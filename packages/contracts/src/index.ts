import type { ComponentType } from "react";

/* ---------- Data shapes passed from the shell (content lives in @skj/content) ---------- */

export interface LighthouseMetric {
  id: string;
  label: string;
  unit: "s" | "ms" | "";
  before: number;
  after: number;
  /** Lower is better for every Core Web Vital we show. */
  lowerIsBetter: boolean;
}

export interface LighthouseComparison {
  /** Real, verified scores. */
  score: { before: number; after: number };
  /** Illustrative breakdown: not measured values from the client project. */
  metrics: LighthouseMetric[];
}

export interface BundleChunk {
  id: string;
  label: string;
  beforeKb: number;
  afterKb: number;
}

export interface BundleBreakdown {
  unit: "KB (gzip)";
  chunks: BundleChunk[];
}

/* ---------- Props per exposed module ---------- */

export interface LighthouseSliderProps {
  data: LighthouseComparison;
}

export interface BundleChartProps {
  data: BundleBreakdown;
}

/* ---------- Registry: "<remote>/<module>" → module shape ---------- */

export interface RemoteModuleMap {
  "caseStudies/LighthouseSlider": ComponentType<LighthouseSliderProps>;
  "caseStudies/BundleChart": ComponentType<BundleChartProps>;
}

export type RemoteModuleId = keyof RemoteModuleMap;
export type RemoteName = RemoteModuleId extends `${infer R}/${string}` ? R : never;
