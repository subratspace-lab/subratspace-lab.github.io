// Next 16's static export writes per-segment RSC payloads in nested folders
//   work/x/__next.work/$d$slug/__PAGE__.txt
// but the client router requests them by a flattened name
//   work/x/__next.work.$d$slug.__PAGE__.txt
// Plain static hosts (GitHub Pages, Netlify, `serve`) then 404 every prefetch. This writes
// the flattened copies next to the nested ones so both names resolve.
//
// Usage: node scripts/flatten-rsc-segments.mjs apps/shell/out
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "apps/shell/out");
let written = 0;

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesUnder(p) : [p];
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name === "_next" || entry.name === "remotes") continue;
    if (entry.name.startsWith("__next.")) {
      for (const file of filesUnder(full)) {
        const rel = path.relative(full, file).split(path.sep).join(".");
        const target = path.join(dir, `${entry.name}.${rel}`);
        if (!fs.existsSync(target)) {
          fs.copyFileSync(file, target);
          written++;
        }
      }
      continue;
    }
    walk(full);
  }
}

if (!fs.existsSync(root)) {
  console.error(`No export found at ${root}`);
  process.exit(1);
}
walk(root);
console.log(`flatten-rsc-segments: wrote ${written} file(s) in ${path.relative(process.cwd(), root) || "."}`);
