import fs from "node:fs";
import path from "node:path";
import {
  awards,
  clientProjects,
  education,
  experience,
  featuredProjects,
  formatYearMonth,
  getCompany,
  getMetrics,
  illustrative,
  metrics,
  profile,
  projects,
} from "./index";

const dataDir = path.join(__dirname, "..", "data");
const allContent = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => fs.readFileSync(path.join(dataDir, f), "utf8"))
  .join("\n");

describe("content hard rules", () => {
  it("never mentions Cypress (Playwright is the E2E tool)", () => {
    expect(allContent).not.toMatch(/cypress/i);
  });

  it("publishes no phone number", () => {
    // Indian mobile formats and generic long digit runs.
    expect(allContent).not.toMatch(/(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/);
    expect(allContent).not.toMatch(/\b\d{10,}\b/);
  });

  it("uses the verified contact details", () => {
    expect(profile.email).toBe("subratspace@gmail.com");
    expect(profile.linkedin).toContain("linkedin.com/in/subrat-kumar-jena-3800a610b");
  });

  it("keeps the verified employment, education and awards", () => {
    expect(experience).toHaveLength(1);
    expect(experience[0]).toMatchObject({
      company: "Clairvoyant India Pvt. Ltd.",
      title: "Software Engineer II",
      start: "2021-02",
      end: "2026-04",
    });
    expect(education).toEqual({ degree: "B.Tech", school: "Indira Gandhi Institute of Technology", start: 2013, end: 2017 });
    expect(awards).toEqual(["Reliable Value Award", "Team Player Value Award"]);
  });

  it("keeps headline metrics at their verified values", () => {
    const byId = Object.fromEntries(metrics.map((m) => [m.id, m]));
    expect(byId.lighthouse).toMatchObject({ before: 62, after: 88 });
    expect(byId.bundle?.display).toBe("~30%");
    expect(byId.mttd?.display).toBe("40%");
    expect(byId.payments?.display).toBe("60%");
    expect(byId.mvp?.display).toBe("2 weeks");
  });

  it("features at most three client projects, all confidential", () => {
    expect(featuredProjects.length).toBeLessThanOrEqual(3);
    for (const p of clientProjects) expect(p.confidential).toBe(true);
  });

  it("structures every case study as problem → constraints → decisions → result → tech", () => {
    for (const p of projects) {
      const cs = p.caseStudy;
      expect(cs.problem.length).toBeGreaterThan(0);
      expect(cs.constraints.length).toBeGreaterThan(0);
      expect(cs.decisions.length).toBeGreaterThan(0);
      expect(cs.result.length).toBeGreaterThan(0);
      expect(cs.tech.length).toBeGreaterThan(0);
    }
  });

  it("keeps personal projects out of the featured client set, with a public link", () => {
    const pbi = projects.find((p) => p.slug === "pbi-autobuilder");
    expect(pbi).toMatchObject({ kind: "personal", confidential: false, period: { start: 2026, end: 2026 } });
    expect(pbi?.links.map((l) => l.href)).toEqual([
      "https://pbi-autobuilder.onrender.com/",
      "https://github.com/subratspace-lab/pbi-autobuilder",
    ]);
    expect(featuredProjects.map((p) => p.slug)).not.toContain("pbi-autobuilder");
  });

  it("keeps the illustrative Lighthouse score equal to the verified one", () => {
    expect(illustrative.lighthouse.score).toEqual({ before: 62, after: 88 });
  });
});

describe("content helpers", () => {
  it("formats year-months", () => {
    expect(formatYearMonth("2021-02")).toBe("Feb 2021");
    expect(formatYearMonth("2026-04")).toBe("Apr 2026");
  });

  it("finds companies case-insensitively", () => {
    expect(getCompany("AVOMA")?.name).toBe("Avoma");
    expect(getCompany("nope")).toBeUndefined();
  });

  it("drops unknown metric ids", () => {
    expect(getMetrics(["lighthouse", "missing"]).map((m) => m.id)).toEqual(["lighthouse"]);
  });
});
