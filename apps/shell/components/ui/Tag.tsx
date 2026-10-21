import styles from "./Tag.module.css";

export function Tag({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "accent" }) {
  return <span className={`${styles.tag} ${tone === "accent" ? styles.accent : ""}`}>{children}</span>;
}

export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
