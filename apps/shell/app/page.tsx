import { featuredProjects, getMetrics, metrics, personalProjects } from "@skj/content";
import { Hero } from "@/components/home/Hero";
import { MetricGrid } from "@/components/home/MetricGrid";
import { ProjectCard } from "@/components/home/ProjectCard";
import { ExperienceList } from "@/components/home/Experience";
import { Skills } from "@/components/home/Skills";
import { Contact } from "@/components/home/Contact";
import { Section } from "@/components/ui/Section";
import styles from "@/components/home/Home.module.css";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section id="results" eyebrow="Results" title="What changed because of my work">
        <MetricGrid items={metrics} />
      </Section>

      <Section
        id="work"
        eyebrow="Selected work"
        title="Three platforms, end to end"
        intro="These are client projects, so I can't show the real screens. Each case study covers the problem, the constraints, what I decided and what happened."
      >
        <ul className={styles.cards}>
          {featuredProjects.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} metrics={getMetrics(p.metricIds)} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Appears automatically once a project with kind: "personal" is added to projects.json. */}
      {personalProjects.length > 0 && (
        <Section id="personal" eyebrow="Personal work" title="Things I build for myself">
          <ul className={styles.cards}>
            {personalProjects.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} metrics={getMetrics(p.metricIds)} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="experience" eyebrow="Experience" title="Where I've worked" deepOnly>
        <ExperienceList />
      </Section>

      <Section id="stack" eyebrow="Stack" title="Tools I've shipped with">
        <Skills />
      </Section>

      <Section id="contact" eyebrow="Contact" title="Get in touch">
        <Contact />
      </Section>
    </>
  );
}
