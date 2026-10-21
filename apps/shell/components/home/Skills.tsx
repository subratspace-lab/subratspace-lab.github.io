import { skills } from "@skj/content";
import { TagList } from "../ui/Tag";
import styles from "./Home.module.css";

export function Skills() {
  return (
    <dl className={styles.skills}>
      {skills.map((group) => (
        <div key={group.id} className={styles.skillGroup}>
          <dt>{group.label}</dt>
          <dd>
            <TagList items={group.items} label={group.label} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
