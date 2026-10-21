import type { Metadata } from "next";
import Link from "next/link";
import { siteBuild } from "@skj/content";
import { SiteDiagram } from "@/components/diagrams/SiteDiagram";
import { Reveal } from "@/components/motion/Reveal";
import styles from "@/components/case-study/CaseStudy.module.css";

export const metadata: Metadata = {
  title: "How this site is built",
  description: siteBuild.lead,
  alternates: { canonical: "/how-its-built" },
};

export default function HowItsBuilt() {
  return (
    <article className={styles.page} aria-labelledby="hib-title">
      <header className={`container ${styles.header}`}>
        <p className="eyebrow">Under the hood</p>
        <h1 id="hib-title" className={styles.title}>
          {siteBuild.title}
        </h1>
        <p className={styles.lead}>{siteBuild.lead}</p>
      </header>

      <div className="container">
        <div className={styles.content}>
          <section aria-labelledby="arch-title" className={styles.block}>
            <h2 id="arch-title">Architecture</h2>
            <SiteDiagram />
          </section>

          <section aria-labelledby="dec-title" className={styles.block}>
            <h2 id="dec-title">Decisions</h2>
            <ol className={styles.decisions}>
              {siteBuild.decisions.map((d, i) => (
                <li key={d.title}>
                  <Reveal delay={Math.min(i, 3) * 0.05} className={styles.decision}>
                    <span className={styles.decisionNum} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className={styles.decisionTitle}>{d.title}</h3>
                      <p>{d.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="q-title" className={styles.block}>
            <h2 id="q-title">Quality</h2>
            <ul className={styles.bullets}>
              {siteBuild.quality.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="see-title" className={styles.block}>
            <h2 id="see-title">See it working</h2>
            <p className={styles.demoNote}>
              The Lighthouse slider and bundle chart in the{" "}
              <Link href="/work/ai-agentic-platform#evidence">AI agent platform case study</Link> load as a federated remote.
              If that remote fails, only its panel shows a fallback; the rest of the page keeps working.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
