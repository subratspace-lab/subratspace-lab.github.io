"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useId, useState } from "react";
import type { Metric, Project } from "@skj/content";
import { TagList } from "../ui/Tag";
import { TodoText } from "../ui/TodoText";
import { formatPeriod } from "@/lib/format";
import { ArrowRightIcon, LockIcon } from "../icons";
import { MotionProvider } from "../motion/MotionProvider";
import styles from "./Home.module.css";

type Props = {
  project: Project;
  /** Resolved on the server (getMetrics) so the client bundle doesn't ship all content. */
  metrics: Metric[];
  headingLevel?: 2 | 3;
};

/**
 * Two levels of detail: "View details" expands the card in place (role, problem, key
 * decisions, results, full stack), and the expanded card links to the full case study.
 */
export function ProjectCard({ project, metrics, headingLevel = 3 }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const Heading = `h${headingLevel}` as const;
  const cs = project.caseStudy;

  return (
    <article className={styles.card} aria-labelledby={`card-${project.slug}`} data-expanded={open || undefined}>
      <p className={styles.cardMeta}>
        <span>
          {formatPeriod(project.period)}
        </span>
        {project.confidential ? (
          <span className={styles.confidential}>
            <LockIcon size={14} /> Confidential client
          </span>
        ) : (
          <span>Personal project</span>
        )}
      </p>
      <Heading id={`card-${project.slug}`} className={styles.cardTitle}>
        {project.title}
      </Heading>
      <p className={styles.cardBody}>{project.oneLiner}</p>

      {metrics.length > 0 && (
        <ul className={styles.cardMetrics} aria-label="Results">
          {metrics.map((mt) => (
            <li key={mt.id}>
              <strong>{mt.display}</strong> {mt.label.toLowerCase()}
            </li>
          ))}
        </ul>
      )}

      {!open && (
        <div data-deep-only="">
          <TagList items={project.stack.slice(0, 6)} label="Stack" />
        </div>
      )}

      {/* Framer Motion is scoped to the card (the only place it animates), so other pages don't load it. */}
      <MotionProvider>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            key="details"
            className={styles.details}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className={styles.detailsInner}>
              <dl className={styles.facts}>
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
                {project.confidential && (
                  <div>
                    <dt>Client</dt>
                    <dd>Confidential</dd>
                  </div>
                )}
              </dl>

              <div className={styles.detailsGrid}>
                <section aria-label="The problem">
                  <h4 className={styles.detailsTitle}>The problem</h4>
                  <p>
                    <TodoText text={cs.problem[0] ?? ""} />
                  </p>
                </section>

                <section aria-label="Key decisions">
                  <h4 className={styles.detailsTitle}>Key decisions</h4>
                  <ol className={styles.detailsList}>
                    {cs.decisions.map((d) => (
                      <li key={d.title}>{d.title}</li>
                    ))}
                  </ol>
                </section>

                <section aria-label="Results">
                  <h4 className={styles.detailsTitle}>Results</h4>
                  <ul className={styles.detailsList}>
                    {cs.result.map((r) => (
                      <li key={r}>
                        <TodoText text={r} />
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-label="Tech">
                  <h4 className={styles.detailsTitle}>Tech</h4>
                  <TagList items={cs.tech} label="Full stack" />
                </section>
              </div>

              <div className={styles.detailsActions}>
                <Link href={`/work/${project.slug}`} className={styles.fullLink}>
                  Read the full case study <ArrowRightIcon size={16} />
                </Link>
                {project.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      </MotionProvider>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Show less" : "View details"}
        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        <span className="visually-hidden"> for {project.title}</span>
      </button>
    </article>
  );
}
