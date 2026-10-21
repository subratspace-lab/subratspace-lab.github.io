import type { ReactNode } from "react";
import styles from "./IllustrativeBadge.module.css";

export function IllustrativeBadge({ children }: { children: ReactNode }) {
  return (
    <span className={styles.badge}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v.01M12 11v5" />
      </svg>
      {children}
    </span>
  );
}
