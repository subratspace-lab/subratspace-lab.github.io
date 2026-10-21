"use client";

import { MODE_LABELS, setMode, useMode, type Mode } from "@/lib/mode";
import styles from "./ModeToggle.module.css";

const OPTIONS: { value: Mode; short: string }[] = [
  { value: "skim", short: "Skim" },
  { value: "deep", short: "Deep dive" },
];

/**
 * The sliding pill is positioned in CSS from <html data-mode>, so it is correct on first
 * paint (before hydration) and animates with a plain transition.
 */
export function ModeToggle() {
  const mode = useMode();

  return (
    <div className={styles.toggle} role="group" aria-label="Reading mode">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={styles.option}
          data-value={opt.value}
          aria-pressed={mode === opt.value}
          title={MODE_LABELS[opt.value]}
          onClick={() => setMode(opt.value)}
          data-testid={`mode-${opt.value}`}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
