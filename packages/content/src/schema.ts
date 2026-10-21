import { z } from "zod";

/** Any string containing this marker is rendered with a visible TODO style. */
export const TODO_MARKER = "[TODO: Subrat to fill]";

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected YYYY-MM");

export const profileSchema = z.object({
  name: z.string(),
  role: z.string(),
  focus: z.string(),
  location: z.string(),
  yearsExperience: z.number().int().positive(),
  headline: z.string(),
  summary: z.array(z.string()).min(1),
  email: z.string().email(),
  linkedin: z.string().url(),
  resumePath: z.string().startsWith("/"),
  siteUrl: z.string().url(),
});

export const experienceSchema = z.object({
  company: z.string(),
  companyNote: z.string().optional(),
  title: z.string(),
  start: yearMonth,
  end: yearMonth,
  location: z.string(),
  highlights: z.array(z.string()),
});

export const educationSchema = z.object({
  degree: z.string(),
  school: z.string(),
  start: z.number().int(),
  end: z.number().int(),
});

export const skillGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  items: z.array(z.string()).min(1),
});

export const metricSchema = z.object({
  id: z.string(),
  label: z.string(),
  /** Short display value, e.g. "62 → 88" or "~30%". */
  display: z.string(),
  context: z.string(),
  projectSlug: z.string(),
  before: z.number().optional(),
  after: z.number().optional(),
});

export const caseStudySchema = z.object({
  problem: z.array(z.string()).min(1),
  constraints: z.array(z.string()).min(1),
  /** Optional step-by-step walkthrough (e.g. a product's workflow). */
  howItWorks: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
  decisions: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  result: z.array(z.string()).min(1),
  /** Optional reflections, mostly for personal projects. */
  learned: z.array(z.string()).optional(),
  tech: z.array(z.string()).min(1),
});

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    /** "client" = confidential work at a previous employer; "personal" = my own work. */
    kind: z.enum(["client", "personal"]),
    title: z.string(),
    oneLiner: z.string(),
    period: z.object({ start: z.number().int(), end: z.number().int() }),
    employer: z.string().optional(),
    ownership: z.string(),
    featured: z.boolean(),
    confidential: z.boolean(),
    stack: z.array(z.string()).min(1),
    metricIds: z.array(z.string()),
    caseStudy: caseStudySchema,
    links: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
  })
  .refine((p) => p.kind === "personal" || p.confidential, {
    message: "Client projects must be marked confidential",
  });

export const companySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  intro: z.string(),
  pinnedProjects: z.array(z.string()).min(1).max(3),
  highlightMetricIds: z.array(z.string()),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Company = z.infer<typeof companySchema>;

export const illustrativeSchema = z.object({
  _note: z.string(),
  lighthouse: z.object({
    score: z.object({ before: z.number(), after: z.number() }),
    metrics: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        unit: z.enum(["s", "ms", ""]),
        before: z.number(),
        after: z.number(),
        lowerIsBetter: z.boolean(),
      }),
    ),
  }),
  bundle: z.object({
    unit: z.literal("KB (gzip)"),
    chunks: z.array(z.object({ id: z.string(), label: z.string(), beforeKb: z.number(), afterKb: z.number() })),
  }),
});

export type Illustrative = z.infer<typeof illustrativeSchema>;

export const siteBuildSchema = z.object({
  title: z.string(),
  lead: z.string(),
  decisions: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  quality: z.array(z.string()).min(1),
});
