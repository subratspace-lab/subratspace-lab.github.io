import type { MetadataRoute } from "next";
import { projects } from "@skj/content";
import { siteUrl } from "@/lib/site";

// Static export: rendered once at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    "/",
    "/how-its-built",
    ...projects.map((p) => `/work/${p.slug}`),
  ];
  return paths.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
