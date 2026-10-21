# Subrat Kumar Jena · Portfolio

[![CI](https://github.com/subratspace-lab/subratspace-lab.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/subratspace-lab/subratspace-lab.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/subratspace-lab/subratspace-lab.github.io/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/subratspace-lab/subratspace-lab.github.io/actions/workflows/deploy-pages.yml)

**Live: https://subratspace-lab.github.io**

Personal portfolio for a frontend-focused Software Engineer (React + TypeScript). The site proves the skills it describes: a Next.js shell loads an independently built **Webpack Module Federation** remote for the interactive case-study charts, every project has a two-level "View details" experience backed by typed content, and quality is enforced by CI.

It is a **fully static export**: no server, so it deploys for free on Vercel's Hobby plan, GitHub Pages, Netlify or Cloudflare Pages.

| What | Where |
| --- | --- |
| 30-second skim | `/?mode=skim`: name, role, metrics, stack, résumé, contact |
| Project details | On the home page, **View details** expands a card (role, problem, decisions, results, tech); **Read the full case study** opens `/work/<project>` |
| Case studies | `/work/ai-agentic-platform`, `/work/saas-elearning`, `/work/edtech-platform` |
| Company page | `/for/avoma` (noindex, shared by link) |
| Architecture | `/how-its-built` |
| Command palette | <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> anywhere |

---

## Quick start

Requirements: **Node 22** (see `.nvmrc`; Node ≥ 20.11 works) and npm.

```bash
npm install
npm run dev          # builds the remotes, then runs Next + every remote in watch mode
```

Open http://localhost:3000.

```bash
npm run build        # remotes → apps/shell/public/remotes, then the static export → apps/shell/out
npm run preview      # serves apps/shell/out on http://localhost:3000, like a static host would
```

### All scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Build the remote once, then `next dev` + `webpack --watch` for the remote |
| `npm run build` | `build:remotes` then `next build` (static export) and RSC segment flattening |
| `npm run build:remotes` | Build the remote into `apps/shell/public/remotes/case-studies/` |
| `npm run preview` | Serve the export on :3000 (`preview:ci` serves on :4173 for tests) |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules, React Compiler checks) |
| `npm run typecheck` | `tsc --noEmit` in every workspace + the e2e folder |
| `npm test` | Jest + React Testing Library (28 tests) |
| `npm run test:e2e` | Playwright against the static export (41 tests incl. axe and 360px checks) |
| `npm run lighthouse` | Lighthouse (mobile, throttled, median of 3) on 5 pages; fails below 95 |

---

## Architecture

```
   shared packages (build time)
   @skj/content    JSON + Zod: every word, metric, project, company page
   @skj/contracts  typed props for every exposed remote module
   @skj/ui-tokens  CSS custom properties shared by shell and remote
   @skj/mf-config  webpack + Module Federation config factory for remotes
            │                                      │
            ▼                                      ▼
   apps/shell  (Next.js 16, App Router)      apps/remote-case-studies
   static export: HTML/JS/CSS only    loads  (webpack 5 + @module-federation/enhanced)
   routing · SEO · content · modes · ⌘K ───▶ Lighthouse slider · Recharts bundle chart
   @module-federation/runtime host  at runtime
   provides React as a singleton
   RemoteWidget: lazy + error boundary
```

### Module Federation layout

- **The shell is a runtime host.** Next.js App Router has no supported Module Federation build plugin (`@module-federation/nextjs-mf` targets the Pages Router), so the shell uses `@module-federation/runtime` (`createInstance` + `loadRemote`) in client components. See `apps/shell/lib/federation/`.
- **Remotes are plain webpack builds** from one factory, `packages/mf-config/createRemoteConfig.mjs`. `case-studies` exposes `./LighthouseSlider` and `./BundleChart` through `remoteEntry.js`. Adding another remote is one folder plus one registry entry.
- **One React.** Remotes declare `react`, `react-dom` and `react/jsx-runtime` as shared singletons with `import: false`. They never bundle React, and the shell provides the instance Next.js renders with (its version string is normalized so `^19` matches Next's canary React).
- **Typed boundary.** `packages/contracts` maps every `"remote/Module"` id to its props. `RemoteWidget<Id>` only accepts the props that module declares.
- **Fault isolation.** `components/RemoteWidget.tsx` wraps each remote. It handles a failed network load and a crash during render separately, shows a contained fallback with retry, and reserves space to avoid layout shift. An e2e test blocks `remoteEntry.js` and checks that the rest of the case study still works.
- **Lazy by default.** A remote is fetched only when it comes within 300px of the viewport, so remote code never competes with first paint or hydration.

### Deploying a remote independently

By default every remote builds into the shell's `public/remotes/` so one static deployment serves everything. To ship a remote on its own:

```bash
REMOTE_OUT_DIR=dist npm run build -w @skj/remote-case-studies   # → dist/case-studies/remoteEntry.js
```

Host that folder anywhere (it needs CORS for the shell's origin), then build the shell with its URL:

```bash
NEXT_PUBLIC_REMOTE_CASE_STUDIES_URL=https://charts.example.com/remoteEntry.js npm run build -w @skj/shell
```

Each remote has a matching `NEXT_PUBLIC_REMOTE_<NAME>_URL` variable (see `apps/shell/lib/federation/remotes.ts`).

### Repository layout

```
apps/
  shell/                     Next.js host (app/, components/, lib/)
  remote-case-studies/       Lighthouse slider, Recharts bundle chart
packages/
  content/   data/*.json + src/schema.ts (Zod) + src/index.ts (parsed, cross-checked exports)
  contracts/ module prop types
  ui-tokens/ tokens.css (light/dark, WCAG AA ratios noted inline)
  mf-config/ shared webpack/Module Federation factory
e2e/         Playwright specs (flows, federation, a11y, responsive)
scripts/     lighthouse.mjs, flatten-rsc-segments.mjs
```

---

## Content schema

All copy lives in `packages/content/data/*.json`, validated with Zod at build time. **Invalid content fails `next build`.**

| File | Holds |
| --- | --- |
| `profile.json` | Name, role, headline, summary, contact, `siteUrl` |
| `experience.json`, `education.json`, `awards.json`, `skills.json` | Career facts |
| `metrics.json` | Headline results (verified values only) |
| `projects.json` | Projects with `kind: "client" \| "personal"` and a `caseStudy` of `problem`, `constraints`, `decisions`, `result`, `tech` |
| `companies.json` | `/for/[company]` pages: intro line, pinned projects, highlighted metrics |
| `illustrative.json` | Chart data that is **illustrative**. Only the 62 → 88 Lighthouse score is real. |
| `site-build.json` | Copy for `/how-its-built` |

Guards in `src/index.ts` and `src/content.test.ts`:

- Broken cross-references (unknown metric or project) throw.
- At most 3 featured client projects, and every client project is `confidential`.
- The illustrative Lighthouse score must equal the verified one, and the illustrative bundle totals must stay at about 30%.
- No phone number, no mention of Cypress, and the employment, education, award and metric facts stay as verified.

Missing facts are written as `[TODO: Subrat to fill]` and render as visible amber labels, so they are never mistaken for real copy.

### Common edits

- **Add a company page:** add an object to `companies.json`. `/for/<slug>` is generated on the next build.
- **Add personal work:** add a project with `"kind": "personal"`, `"confidential": false` and optional `links`. A "Personal work" section appears on the home page automatically.
- **Replace the résumé:** overwrite `apps/shell/public/Subrat_Kumar_Jena_Resume.pdf` (or change `resumePath` in `profile.json`).

---

## Testing

- **Unit (Jest + RTL):** content hard rules, the expandable project card, command search and ranking, `RemoteWidget` load/crash/retry, mode toggle and email menu.
- **E2E (Playwright, against the static export):** View details → full case study, recruiter mode and `?mode=` links, the command palette by keyboard, federated widgets (lazy, keyboard slider, table view), a 404'd remote degrading gracefully, `/for/avoma`, the 404 page, the OG image, sitemap and robots.
- **Accessibility:** axe (WCAG 2.1 A/AA) on 6 pages in light and dark themes, after scrolling so lazy remotes are audited too.
- **Responsive:** no horizontal scroll at 360px on 7 pages, including an expanded card.

Locally, Playwright uses the installed **Microsoft Edge** (`channel: "msedge"`), so no browser download is needed. Use `PW_CHANNEL=chrome` for Chrome. CI installs Playwright's Chromium.

### Lighthouse

```bash
npm run build
npm run preview:ci      # terminal 1: serves on :4173
npm run lighthouse      # terminal 2
```

Last local run (mobile, simulated throttling, median of 3):

| Page | Perf | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 98 | 100 | 100 | 100 |
| `/work/ai-agentic-platform` | 96 | 100 | 100 | 100 |
| `/work/saas-elearning` | 96 | 100 | 100 | 100 |
| `/how-its-built` | 97 | 100 | 100 | 100 |
| `/for/avoma` | 97 | 100 | 100 | 66* |

Scores move a few points with machine load; close heavy apps for a fair run. Most of the margin comes from shipping less JavaScript before first paint: the federation runtime and remotes load only when needed, content and Zod stay on the server, and Framer Motion loads only where it animates (the project cards).

\* `/for/*` pages are `noindex` on purpose, which Lighthouse's SEO audit penalizes. The script reports that score but doesn't fail the budget on it.

---

## CI

`.github/workflows/ci.yml` runs on every push and pull request: **install → lint → typecheck → unit tests (with coverage) → build → Playwright e2e → Lighthouse**. Reports are uploaded as an artifact. The Lighthouse step is informational on CI, because shared runners are noisy; the local script enforces the budget.

---

## Deploy (free)

### Vercel (Hobby plan, recommended)

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project → Import** this repo. Leave **Root Directory** at the repo root.
3. Nothing else to set: `vercel.json` defines `npm ci`, `npm run build`, output `apps/shell/out`, clean URLs and security headers.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to your final domain (it's used in the sitemap, canonical and OG URLs).

### GitHub Pages

Already set up for this repo. For a fork: repo **Settings → Pages → Source: GitHub Actions**, then push to `main`. The workflow serves a `<user>.github.io` repo at the domain root and any other repo under `/<repo>`, and adds `.nojekyll`.

### Netlify / Cloudflare Pages

Build command `npm run build`, publish directory `apps/shell/out`. Headers come from `apps/shell/public/_headers`.

---

## Notes and trade-offs

- **Why a runtime MF host?** It's the supported way to federate into the App Router today, and it keeps every remote a plain, independently deployable webpack build.
- **webpack is pinned to `~5.111`** (root `overrides`): 5.112 removed an internal file that `@module-federation/enhanced` still requires.
- **RSC segment flattening:** Next 16's static export writes per-segment prefetch files in nested folders but requests them by flattened names. `scripts/flatten-rsc-segments.mjs` writes both, so prefetches don't 404 on static hosts.
- **Fonts:** body text uses the native UI font stack (no download, paints at first paint). Headings use one static weight of Fraunces with a size-matched fallback.
- **Jest 29, not 30:** Jest 30's native resolver needs the Microsoft Visual C++ runtime on Windows. Jest 29 is fully supported and has no native dependency.

## Deployment status

This repo deploys itself: every push to `main` runs **Deploy to GitHub Pages** and publishes to https://subratspace-lab.github.io. CI runs on the same push.

Optional: add the real EdTech MVP deadline to its constraints in `packages/content/data/projects.json` (currently "A fixed MVP deadline").
