import { profile } from "@skj/content";

/** Canonical origin. Override per environment with NEXT_PUBLIC_SITE_URL (e.g. Vercel preview URLs). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl).replace(/\/$/, "");

/** Base path for GitHub Pages project sites. next/link adds it automatically; raw <a>/asset URLs need asset(). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${basePath}${path}`;
export const resumeHref = asset(profile.resumePath);

export const siteTitle = `${profile.name} · ${profile.role}`;
export const siteDescription = profile.headline;

export const navItems = [
  { href: "/#work", label: "Work" },
  { href: "/how-its-built", label: "How it's built" },
] as const;
