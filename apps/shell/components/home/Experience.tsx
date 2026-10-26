import { awards, education, experience, formatYearMonth } from "@skj/content";
import styles from "./Home.module.css";

export function ExperienceList() {
  return (
    <div className={styles.experience}>
      <ol className={styles.timeline}>
        {experience.map((job) => (
          <li key={`${job.company}-${job.start}`} className={styles.job}>
            <div className={styles.jobHead}>
              <h3 className={styles.jobTitle}>{job.title}</h3>
              <p className={styles.jobCompany}>
                {job.company}
                {job.companyNote && <span className="muted"> · {job.companyNote}</span>}
              </p>
              <p className={styles.jobDates}>
                <time dateTime={job.start}>{formatYearMonth(job.start)}</time> –{" "}
                <time dateTime={job.end}>{formatYearMonth(job.end)}</time> · {job.location}
              </p>
            </div>
            <ul className={styles.jobHighlights}>
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className={styles.sideFacts}>
        <div>
          <h3 className={styles.factTitle}>Education</h3>
          <p>
            {education.degree}, {education.school}
          </p>
          <p className="muted">
            {education.start}–{education.end}
            {education.grade && ` · ${education.grade}`}
          </p>
        </div>
        <div>
          <h3 className={styles.factTitle}>Awards</h3>
          <ul className={styles.awards}>
            {awards.map((a) => (
              <li key={a.name}>
                <span className={styles.awardName}>{a.name}</span>
                <span className="muted">{a.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
