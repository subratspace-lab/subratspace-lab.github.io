import { featuredProjects } from "@skj/content";
import { buildCommands, filterCommands } from "./commands";

const commands = buildCommands("/resume.pdf");
const titles = (q: string) => filterCommands(commands, q).map((c) => c.title);

describe("command palette commands", () => {
  it("includes every featured case study from content", () => {
    for (const p of featuredProjects) expect(commands.some((c) => c.action.type === "navigate" && c.action.href === `/work/${p.slug}`)).toBe(true);
  });

  it("returns everything, in order, for an empty query", () => {
    expect(filterCommands(commands, "   ")).toEqual(commands);
  });

  it("requires every query word to match", () => {
    expect(titles("edtech")).toEqual(["EdTech Learning Platform"]);
    expect(titles("edtech zebra")).toEqual([]);
  });

  it("ranks title-prefix matches above keyword matches", () => {
    expect(titles("skim")[0]).toBe("Switch to 30-second skim");
    expect(titles("how")[0]).toBe("How this site is built");
  });

  it("matches keywords and is case- and accent-insensitive", () => {
    expect(titles("CV")).toContain("Download résumé");
    expect(titles("resume")).toContain("Download résumé");
  });
});
