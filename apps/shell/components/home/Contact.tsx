import { resumeHref } from "@/lib/site";
import { profile } from "@skj/content";
import { Button } from "../ui/Button";
import { EmailButton } from "../EmailButton";
import { DownloadIcon, LinkedInIcon } from "../icons";
import styles from "./Home.module.css";

export function Contact() {
  return (
    <div className={styles.contact}>
      <p className={styles.contactLead}>
        I&apos;m looking for Frontend and Senior Frontend roles working in React and TypeScript. Email is the fastest
        way to reach me: <span className={styles.contactEmail}>{profile.email}</span>
      </p>
      <div className={styles.heroActions}>
        <EmailButton email={profile.email} variant="primary" />
        <Button href={profile.linkedin} external variant="secondary" icon={<LinkedInIcon />}>
          LinkedIn
        </Button>
        <Button href={resumeHref} download variant="ghost" icon={<DownloadIcon />}>
          Résumé
        </Button>
      </div>
    </div>
  );
}
