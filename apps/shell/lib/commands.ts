import { featuredProjects, personalProjects, profile } from "@skj/content";
import type { Command } from "./command-search";
import { formatPeriod } from "./format";

export { filterCommands, type Command, type CommandAction } from "./command-search";

// Server-only: built from content at render time and passed to the palette as props.
/** Built from content, so new projects appear in the palette automatically. */
export function buildCommands(resumeHref: string): Command[] {
  return [
    { id: "home", group: "Pages", title: "Home", keywords: "start overview", action: { type: "navigate", href: "/" } },
    { id: "work", group: "Pages", title: "Selected work", keywords: "projects case studies", action: { type: "navigate", href: "/#work" } },
    { id: "how", group: "Pages", title: "How this site is built", keywords: "architecture module federation stack", action: { type: "navigate", href: "/how-its-built" } },
    { id: "contact", group: "Pages", title: "Contact", keywords: "email hire", action: { type: "navigate", href: "/#contact" } },
    ...[...featuredProjects, ...personalProjects].map<Command>((p) => ({
      id: `cs-${p.slug}`,
      group: "Case studies",
      title: p.title,
      subtitle: formatPeriod(p.period),
      keywords: p.stack.join(" "),
      action: { type: "navigate", href: `/work/${p.slug}` },
    })),
    { id: "skim", group: "Actions", title: "Switch to 30-second skim", keywords: "recruiter mode summary", action: { type: "mode", mode: "skim" } },
    { id: "deep", group: "Actions", title: "Switch to deep dive", keywords: "mode detail", action: { type: "mode", mode: "deep" } },
    { id: "theme", group: "Actions", title: "Toggle dark / light theme", keywords: "dark light color", action: { type: "theme" } },
    { id: "copy-email", group: "Actions", title: "Copy email address", subtitle: profile.email, keywords: "contact mail", action: { type: "copy-email" } },
    { id: "resume", group: "Actions", title: "Download résumé", subtitle: "PDF", keywords: "cv resume pdf", action: { type: "download", href: resumeHref } },
    { id: "linkedin", group: "Actions", title: "Open LinkedIn", keywords: "profile social", action: { type: "external", href: profile.linkedin } },
  ];
}
