import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredProjects, getMetrics, getProject, projects } from "@skj/content";
import { MetricGrid } from "@/components/home/MetricGrid";
import { TagList } from "@/components/ui/Tag";
import { TodoText } from "@/components/ui/TodoText";
import { ArrowRightIcon, LockIcon } from "@/components/icons";
import { Evidence, EVIDENCE_TITLES } from "@/components/case-study/Evidence";
import { Reveal } from "@/components/motion/Reveal";
import { ModeHint } from "@/components/ModeHint";
import styles from "@/components/case-study/CaseStudy.module.css";
import { formatPeriod } from "@/lib/format";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.oneLiner,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.oneLiner, url: `/work/${project.slug}`, type: "article" },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const cs = project.caseStudy;
  const projectMetrics = getMetrics(project.metricIds);
  const evidenceTitle = EVIDENCE_TITLES[project.slug];

  const index = featuredProjects.findIndex((p) => p.slug === project.slug);
  const next = featuredProjects[(index + 1) % featuredProjects.length];

  const toc = [
    { id: "problem", label: "Problem" },
    { id: "constraints", label: "Constraints" },
    ...(cs.howItWorks?.length ? [{ id: "how", label: "How it works" }] : []),
    { id: "decisions", label: "My decisions" },
    { id: "result", label: "Result" },
    ...(cs.learned?.length ? [{ id: "learned", label: "What I learned" }] : []),
    ...(evidenceTitle ? [{ id: "evidence", label: evidenceTitle }] : []),
    { id: "tech", label: "Tech" },
  ];

  return (
    <article className={styles.page} aria-labelledby="cs-title">
      <header className={`container ${styles.header}`}>
        <Link href="/#work" className={styles.back}>
          ← All work
        </Link>
        <p className={`eyebrow ${styles.meta}`}>
          <span>
            {formatPeriod(project.period)}
          </span>
          {project.employer && <span>{project.employer}</span>}
          {project.confidential && (
            <span className={styles.confidential}>
              <LockIcon size={13} /> Confidential client
            </span>
          )}
        </p>
        <h1 id="cs-title" className={styles.title}>
          {project.title}
        </h1>
        <p className={styles.lead}>{project.oneLiner}</p>
        <dl className={styles.glance} aria-label="At a glance">
          <div>
            <dt>My role</dt>
            <dd>{project.ownership}</dd>
          </div>
          {project.employer && (
            <div>
              <dt>Company</dt>
              <dd>{project.employer}</dd>
            </div>
          )}
          <div>
            <dt>Period</dt>
            <dd>
              {formatPeriod(project.period)}
            </dd>
          </div>
          <div>
            <dt>Client</dt>
            <dd>{project.confidential ? "Confidential" : "Personal project"}</dd>
          </div>
          <div className={styles.glanceWide}>
            <dt>Stack</dt>
            <dd>{project.stack.join(" · ")}</dd>
          </div>
        </dl>
        {project.links.length > 0 && (
          <ul className={styles.links} aria-label="Project links">
            {project.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {projectMetrics.length > 0 && (
        <div className="container">
          <MetricGrid items={projectMetrics} label="Results" />
        </div>
      )}

      {/* 30-second skim: results and stack only. */}
      <section className={`container ${styles.tldr}`} data-skim-only="" aria-labelledby="tldr-title">
        <h2 id="tldr-title" className={styles.tldrTitle}>
          In 30 seconds
        </h2>
        <ul className={styles.bullets}>
          {cs.result.map((r) => (
            <li key={r}>
              <TodoText text={r} />
            </li>
          ))}
        </ul>
        <TagList items={cs.tech} label="Tech" />
        <ModeHint />
      </section>

      <div className={`container ${styles.body}`} data-deep-only="">
        <nav className={styles.toc} aria-label="On this page">
          <p className={styles.tocTitle}>On this page</p>
          <ol>
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>{t.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.content}>
          <section id="problem" aria-labelledby="problem-title" className={styles.block}>
            <h2 id="problem-title">Problem</h2>
            <Reveal className={styles.prose}>
              {cs.problem.map((p) => (
                <p key={p}>
                  <TodoText text={p} />
                </p>
              ))}
            </Reveal>
          </section>

          <section id="constraints" aria-labelledby="constraints-title" className={styles.block}>
            <h2 id="constraints-title">Constraints</h2>
            <Reveal>
              <ul className={styles.bullets}>
                {cs.constraints.map((c) => (
                  <li key={c}>
                    <TodoText text={c} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          {cs.howItWorks && cs.howItWorks.length > 0 && (
            <section id="how" aria-labelledby="how-title" className={styles.block}>
              <h2 id="how-title">How it works</h2>
              <ol className={styles.steps}>
                {cs.howItWorks.map((step, i) => (
                  <li key={step.title} className={styles.step}>
                    <span className={styles.stepNum} aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className={styles.decisionTitle}>{step.title}</h3>
                      <p>
                        <TodoText text={step.body} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section id="decisions" aria-labelledby="decisions-title" className={styles.block}>
            <h2 id="decisions-title">My decisions</h2>
            <ol className={styles.decisions}>
              {cs.decisions.map((d, i) => (
                <li key={d.title}>
                  <Reveal delay={Math.min(i, 3) * 0.05} className={styles.decision}>
                    <span className={styles.decisionNum} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className={styles.decisionTitle}>{d.title}</h3>
                      <p>
                        <TodoText text={d.body} />
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>

          <section id="result" aria-labelledby="result-title" className={styles.block}>
            <h2 id="result-title">Result</h2>
            <Reveal>
              <ul className={styles.bullets}>
                {cs.result.map((r) => (
                  <li key={r}>
                    <TodoText text={r} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          {cs.learned && cs.learned.length > 0 && (
            <section id="learned" aria-labelledby="learned-title" className={styles.block}>
              <h2 id="learned-title">What I learned</h2>
              <ul className={styles.bullets}>
                {cs.learned.map((l) => (
                  <li key={l}>
                    <TodoText text={l} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {evidenceTitle && (
            <section id="evidence" aria-labelledby="evidence-title" className={styles.block}>
              <h2 id="evidence-title">{evidenceTitle}</h2>
              <Evidence slug={project.slug} />
            </section>
          )}

          <section id="tech" aria-labelledby="tech-title" className={styles.block}>
            <h2 id="tech-title">Tech</h2>
            <TagList items={cs.tech} label="Tech used" />
          </section>

          {project.confidential && (
            <aside className={styles.confidentialNote} aria-label="About confidentiality">
              <LockIcon size={16} />
              <p>
                This was client work under confidentiality, so there are no real screenshots, client names or code here.
                The numbers are the ones I can share. Diagrams and charts show the approach, not the client&apos;s system.
              </p>
            </aside>
          )}
        </div>
      </div>

      {next && next.slug !== project.slug && (
        <nav className={`container ${styles.next}`} aria-label="Next case study">
          <Link href={`/work/${next.slug}`} className={styles.nextLink}>
            <span className="eyebrow">Next case study</span>
            <span className={styles.nextTitle}>
              {next.title} <ArrowRightIcon />
            </span>
          </Link>
        </nav>
      )}
    </article>
  );
}
