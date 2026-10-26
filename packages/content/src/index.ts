import { z } from "zod";
import profileJson from "../data/profile.json";
import experienceJson from "../data/experience.json";
import educationJson from "../data/education.json";
import awardsJson from "../data/awards.json";
import skillsJson from "../data/skills.json";
import metricsJson from "../data/metrics.json";
import projectsJson from "../data/projects.json";
import companiesJson from "../data/companies.json";
import illustrativeJson from "../data/illustrative.json";
import siteBuildJson from "../data/site-build.json";
import {
  awardSchema,
  companySchema,
  educationSchema,
  experienceSchema,
  illustrativeSchema,
  siteBuildSchema,
  metricSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  type Company,
  type Metric,
  type Project,
} from "./schema";

export * from "./schema";

// Parsing at import time means invalid content fails `next build`, not production.
export const profile = profileSchema.parse(profileJson);
export const experience = z.array(experienceSchema).parse(experienceJson);
export const education = educationSchema.parse(educationJson);
export const awards = z.array(awardSchema).parse(awardsJson);
export const skills = z.array(skillGroupSchema).parse(skillsJson);
export const metrics = z.array(metricSchema).parse(metricsJson);
export const projects = z.array(projectSchema).parse(projectsJson);
export const companies = z.array(companySchema).parse(companiesJson);
/** Illustrative chart data. Only lighthouse.score is a verified number. */
export const illustrative = illustrativeSchema.parse(illustrativeJson);
export const siteBuild = siteBuildSchema.parse(siteBuildJson);

function assertRefs(): void {
  const projectSlugs = new Set(projects.map((p) => p.slug));
  const metricIds = new Set(metrics.map((m) => m.id));
  const errors: string[] = [];
  const check = (ok: boolean, msg: string) => {
    if (!ok) errors.push(msg);
  };

  const featuredClient = projects.filter((p) => p.featured && p.kind === "client");
  check(featuredClient.length <= 3, "At most 3 featured client projects are allowed");

  for (const m of metrics) check(projectSlugs.has(m.projectSlug), `metric ${m.id}: unknown project ${m.projectSlug}`);
  for (const p of projects) {
    for (const id of p.metricIds) check(metricIds.has(id), `project ${p.slug}: unknown metric ${id}`);
  }
  for (const c of companies) {
    for (const s of c.pinnedProjects) check(projectSlugs.has(s), `company ${c.slug}: unknown project ${s}`);
    for (const id of c.highlightMetricIds) check(metricIds.has(id), `company ${c.slug}: unknown metric ${id}`);
  }
  if (errors.length) throw new Error(`Content reference errors:\n- ${errors.join("\n- ")}`);
}
assertRefs();

export const clientProjects = projects.filter((p) => p.kind === "client");
export const personalProjects = projects.filter((p) => p.kind === "personal");
export const featuredProjects = clientProjects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug.toLowerCase());
}
export function getMetrics(ids: readonly string[]): Metric[] {
  return ids.map((id) => metrics.find((m) => m.id === id)).filter((m): m is Metric => Boolean(m));
}

/** "2021-02" → "Feb 2021" */
export function formatYearMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// The illustrative score must match the verified Lighthouse metric, and the chunk totals
// must stay consistent with the verified ~30% bundle reduction.
(() => {
  const lh = metrics.find((m) => m.id === "lighthouse");
  if (lh && (lh.before !== illustrative.lighthouse.score.before || lh.after !== illustrative.lighthouse.score.after)) {
    throw new Error("illustrative.lighthouse.score must match the verified lighthouse metric");
  }
  const before = illustrative.bundle.chunks.reduce((s, c) => s + c.beforeKb, 0);
  const after = illustrative.bundle.chunks.reduce((s, c) => s + c.afterKb, 0);
  const reduction = 1 - after / before;
  if (reduction < 0.27 || reduction > 0.33) {
    throw new Error(`illustrative bundle reduction is ${(reduction * 100).toFixed(1)}%, expected ~30%`);
  }
})();
