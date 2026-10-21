"use client";

import { useHtmlAttribute } from "@/lib/use-html-attribute";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { MoonIcon, SunIcon } from "./icons";
import styles from "./Header.module.css";

export type Theme = "light" | "dark";

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}

export function ThemeToggle() {
  const theme = useHtmlAttribute<Theme>("data-theme", "light");
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
