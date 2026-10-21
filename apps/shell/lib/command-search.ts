// Client-safe: no content import, so the palette doesn't ship Zod or the content JSON to the browser.

export type CommandAction =
  | { type: "navigate"; href: string }
  | { type: "mode"; mode: "skim" | "deep" }
  | { type: "theme" }
  | { type: "copy-email" }
  | { type: "external"; href: string }
  | { type: "download"; href: string };

export interface Command {
  id: string;
  group: "Pages" | "Case studies" | "Actions";
  title: string;
  subtitle?: string;
  keywords?: string;
  action: CommandAction;
}

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Every query word must appear somewhere in the command; ranking prefers title-prefix,
 * then title, then keyword matches. Empty query returns everything in group order.
 */
export function filterCommands(commands: readonly Command[], query: string): Command[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return commands.slice();

  const scored: { cmd: Command; score: number; index: number }[] = [];
  commands.forEach((cmd, index) => {
    const title = normalize(cmd.title);
    const haystack = `${title} ${normalize(cmd.subtitle ?? "")} ${normalize(cmd.keywords ?? "")} ${normalize(cmd.group)}`;
    if (!words.every((w) => haystack.includes(w))) return;
    let score = 0;
    for (const w of words) {
      if (title.startsWith(w)) score += 3;
      else if (title.split(/\s+/).some((t) => t.startsWith(w))) score += 2;
      else if (title.includes(w)) score += 1;
    }
    scored.push({ cmd, score, index });
  });
  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.cmd);
}
