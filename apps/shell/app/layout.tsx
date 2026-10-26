import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { profile } from "@skj/content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { asset, siteDescription, siteTitle, siteUrl } from "@/lib/site";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

// Body text uses the native UI font (no download, paints at first paint, so LCP never waits
// on a font). Headings use one static weight of Fraunces; "optional" avoids a late swap.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500"], display: "swap", variable: "--font-fraunces" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s · ${profile.name}` },
  description: siteDescription,
  applicationName: `${profile.name} portfolio`,
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  keywords: ["Full Stack Engineer", "React", "TypeScript", "Node.js", "Express", "PostgreSQL", "AWS", "Next.js", "Module Federation", "Bengaluru"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title: siteTitle,
    description: siteDescription,
    locale: "en_IN",
    // asset(): keeps the base path on GitHub Pages project sites.
    images: [{ url: asset("/og.png"), width: 1200, height: 630, alt: `${profile.name}, ${profile.role}` }],
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: [asset("/og.png")] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  url: siteUrl,
  sameAs: [profile.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
