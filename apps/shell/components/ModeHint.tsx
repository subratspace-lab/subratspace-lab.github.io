"use client";

import { setMode } from "@/lib/mode";
import styles from "./home/Home.module.css";

/** Contextual nudge between modes. Both variants are rendered; CSS shows the relevant one. */
export function ModeHint() {
  return (
    <>
      <p className={styles.modeHint} data-deep-only="">
        Short on time?{" "}
        <button type="button" className={styles.modeHintButton} onClick={() => setMode("skim")}>
          Switch to the 30-second skim
        </button>
      </p>
      <p className={styles.modeHint} data-skim-only="">
        You&apos;re in skim mode.{" "}
        <button type="button" className={styles.modeHintButton} onClick={() => setMode("deep")}>
          Deep dive for full case studies and architecture
        </button>
      </p>
    </>
  );
}
