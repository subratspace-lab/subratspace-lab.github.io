import type { RemoteName } from "@skj/contracts";

/**
 * Where each remote's container lives. Defaults to the copy built into /public/remotes,
 * so a single static deployment serves everything. Point an env var at another origin to
 * deploy that remote on its own.
 */
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function entry(envUrl: string | undefined, folder: string): string {
  const base = envUrl || `${BASE_PATH}/remotes/${folder}/remoteEntry.js`;
  // remoteEntry.js has a stable name, so bust caches per shell build.
  return `${base}${base.includes("?") ? "&" : "?"}v=${BUILD_ID}`;
}

// Env vars must be referenced literally so Next inlines them at build time.
export const REMOTES: Record<RemoteName, { entry: string; folder: string }> = {
  caseStudies: {
    folder: "case-studies",
    entry: entry(process.env.NEXT_PUBLIC_REMOTE_CASE_STUDIES_URL, "case-studies"),
  },
};

