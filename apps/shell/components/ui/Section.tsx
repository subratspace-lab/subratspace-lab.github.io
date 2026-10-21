import type { ReactNode } from "react";
import { Reveal } from "../motion/Reveal";
import styles from "./Section.module.css";

type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  /** Hide the section in "30-second skim" mode. */
  deepOnly?: boolean;
};

export function Section({ id, eyebrow, title, intro, children, deepOnly }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={styles.section}
      data-deep-only={deepOnly ? "" : undefined}
    >
      <div className="container">
        <header className={styles.header}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-title`}>{title}</h2>
          {intro && <div className={styles.intro}>{intro}</div>}
        </header>
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
