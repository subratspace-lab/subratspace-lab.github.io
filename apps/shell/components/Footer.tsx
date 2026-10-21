import { resumeHref } from "@/lib/site";
import { profile } from "@skj/content";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          {profile.name} · {profile.location}
        </p>
        <ul className={styles.links} aria-label="Contact">
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={resumeHref} download>
              Résumé (PDF)
            </a>
          </li>
        </ul>
        <p className={styles.note}>
          Client work is confidential. Diagrams and charts show the approach, not the client&apos;s systems.
        </p>
      </div>
    </footer>
  );
}
