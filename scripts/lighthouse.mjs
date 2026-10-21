// Runs Lighthouse (mobile, simulated throttling: the strict default) RUNS times per page against a served static
// export and fails if any category on any page is below the budget.
//
//   npm run build && npm run preview:ci   (in another terminal: serves apps/shell/out on :4173)
//   npm run lighthouse
//
// Uses CHROME_PATH if set, otherwise the installed Microsoft Edge or Chrome.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const lighthouseCli = path.join(path.dirname(createRequire(import.meta.url).resolve("lighthouse/package.json")), "cli", "index.js");

const BASE = process.env.LH_BASE_URL ?? "http://localhost:4173";
const BUDGET = Number(process.env.LH_BUDGET ?? 95);
// Lighthouse performance varies ±5 between runs; like Lighthouse CI, report the median.
const RUNS = Number(process.env.LH_RUNS ?? 3);
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const PAGES = process.env.LH_PAGES?.split(",") ?? ["/", "/work/ai-agentic-platform", "/work/saas-elearning", "/how-its-built", "/for/avoma"];
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
// Company pages are deliberately noindex (shared by link only), which Lighthouse SEO
// penalizes by design. Report their SEO score but don't fail the budget on it.
const NOINDEX = new Set(["/for/avoma"]);

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find((p) => fs.existsSync(p));
}

const browser = findBrowser();
const outDir = path.resolve("lighthouse-report");
fs.mkdirSync(outDir, { recursive: true });

const rows = [];
let failed = false;

for (const page of PAGES) {
  const name = page === "/" ? "home" : page.slice(1).replaceAll("/", "_");
  const runs = [];
  for (let run = 0; run < RUNS; run++) {
  const output = path.join(outDir, `${name}.${run}.json`);
  const args = [
    lighthouseCli,
    `${BASE}${page}`,
    `--only-categories=${CATEGORIES.join(",")}`,
    "--output=json",
    `--output-path=${output}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-first-run --disable-extensions",
    ...(browser ? [`--chrome-path=${browser}`] : []),
  ];
  const res = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (res.status !== 0 || !fs.existsSync(output)) {
    console.error(`Lighthouse failed for ${page}`);
    failed = true;
    continue;
  }
  const report = JSON.parse(fs.readFileSync(output, "utf8"));
  runs.push(Object.fromEntries(CATEGORIES.map((c) => [c, Math.round((report.categories[c]?.score ?? 0) * 100)])));
  }
  if (runs.length === 0) continue;
  const scores = Object.fromEntries(CATEGORIES.map((c) => [c, median(runs.map((r) => r[c]))]));
  rows.push({ page, ...scores, ...(NOINDEX.has(page) ? { note: "noindex by design" } : {}) });
  const budgeted = Object.entries(scores).filter(([c]) => !(c === "seo" && NOINDEX.has(page)));
  if (budgeted.some(([, s]) => s < BUDGET)) failed = true;
}

console.table(rows);
if (failed) {
  console.error(`One or more scores are below ${BUDGET}. Reports: ${outDir}`);
  process.exit(1);
}
console.log(`All pages ≥ ${BUDGET} in every category.`);
