import type { NextConfig } from "next";

/**
 * Fully static export (`out/`): no server at runtime, so it deploys free on Vercel Hobby,
 * GitHub Pages, Netlify or Cloudflare Pages. Security/cache headers live in the host's own
 * config (vercel.json, public/_headers) because static hosts don't run next.config headers().
 *
 * NEXT_PUBLIC_BASE_PATH supports GitHub Pages project sites (e.g. "/portfolio").
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  transpilePackages: ["@skj/content", "@skj/contracts"],
  env: {
    // Used to cache-bust each remoteEntry.js per deployment.
    NEXT_PUBLIC_BUILD_ID:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ??
      process.env.GITHUB_SHA?.slice(0, 8) ??
      Date.now().toString(36),
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
