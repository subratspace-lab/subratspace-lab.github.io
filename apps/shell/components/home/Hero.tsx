import { resumeHref } from "@/lib/site";
import { awards, education, experience, formatYearMonth, profile } from "@skj/content";
import { Button } from "../ui/Button";
import { EmailButton } from "../EmailButton";
import { ModeHint } from "../ModeHint";
import { DownloadIcon, LinkedInIcon } from "../icons";
import styles from "./Home.module.css";

export function Hero() {
  const latest = experience[0];

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <p className={`eyebrow ${styles.enter}`} style={{ "--i": 0 } as React.CSSProperties}>
          {profile.role} · {profile.focus}
        </p>
        <h1 id="hero-title" className={`${styles.heroTitle} ${styles.enterSlide}`} style={{ "--i": 0 } as React.CSSProperties}>
          {profile.name}
        </h1>
        <p className={`${styles.heroHeadline} ${styles.enterSlide}`} style={{ "--i": 1 } as React.CSSProperties}>{profile.headline}</p>

        <dl className={`${styles.heroMeta} ${styles.enter}`} style={{ "--i": 2 } as React.CSSProperties}>
          <div>
            <dt>Experience</dt>
            <dd>{profile.yearsExperience} years</dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Split</dt>
            <dd>~70% frontend · ~30% backend</dd>
          </div>
        </dl>

        {latest && (
          <dl className={styles.glance} data-skim-only="" aria-label="At a glance">
            <div>
              <dt>Most recent role</dt>
              <dd>
                {latest.title}, {latest.company}
                <span className="muted">
                  {" "}
                  · {formatYearMonth(latest.start)} – {formatYearMonth(latest.end)}
                </span>
              </dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>
                {education.degree}, {education.school}
                <span className="muted"> · {education.end}</span>
              </dd>
            </div>
            <div>
              <dt>Awards</dt>
              <dd>{awards.join(" · ")}</dd>
            </div>
          </dl>
        )}

        <div className={`${styles.heroActions} ${styles.enter}`} style={{ "--i": 3 } as React.CSSProperties}>
          <Button href={resumeHref} download icon={<DownloadIcon />}>
            Download résumé
          </Button>
          <EmailButton email={profile.email} />
          <Button href={profile.linkedin} external variant="ghost" icon={<LinkedInIcon />}>
            LinkedIn
          </Button>
        </div>

        <div className={`${styles.enter}`} style={{ "--i": 4 } as React.CSSProperties}>
          <ModeHint />
        </div>
      </div>
    </section>
  );
}
