import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { companies, getCompany, getMetrics, getProject, profile, type Project } from "@skj/content";
import { Contact } from "@/components/home/Contact";
import { MetricGrid } from "@/components/home/MetricGrid";
import { ProjectCard } from "@/components/home/ProjectCard";
import { Section } from "@/components/ui/Section";
import home from "@/components/home/Home.module.css";
import styles from "./Company.module.css";

type Params = { company: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return companies.map((c) => ({ company: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { company } = await params;
  const c = getCompany(company);
  if (!c) return {};
  return {
    title: `For ${c.name}`,
    description: c.intro,
    // Shared by direct link only.
    robots: { index: false, follow: false },
    alternates: { canonical: `/for/${c.slug}` },
  };
}

export default async function CompanyPage({ params }: { params: Promise<Params> }) {
  const { company } = await params;
  const c = getCompany(company);
  if (!c) notFound();

  const pinned = c.pinnedProjects.map(getProject).filter((p): p is Project => Boolean(p));

  return (
    <>
      <section className={`container ${styles.hero}`} aria-labelledby="for-title">
        <p className="eyebrow">Prepared for {c.name}</p>
        <h1 id="for-title" className={styles.title}>
          {profile.name}
        </h1>
        <p className={styles.role}>
          {profile.role} · {profile.focus} · {profile.location}
        </p>
        <p className={styles.intro}>{c.intro}</p>
        <p className={styles.links}>
          <Link href="/">See the full portfolio</Link>
          <Link href="/#contact">Get in touch</Link>
        </p>
      </section>

      <Section id="for-results" eyebrow="Results" title="Most relevant numbers">
        <MetricGrid items={getMetrics(c.highlightMetricIds)} />
      </Section>

      <Section id="for-work" eyebrow="Pinned for you" title="Start with these">
        <ul className={`${home.cards} ${styles.pinned}`}>
          {pinned.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} metrics={getMetrics(p.metricIds)} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="for-contact" eyebrow="Contact" title="Get in touch">
        <Contact />
      </Section>
    </>
  );
}
