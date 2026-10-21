import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Static export: rendered once at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // Company-tailored pages are shared by link; keep them out of search results.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/for/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
