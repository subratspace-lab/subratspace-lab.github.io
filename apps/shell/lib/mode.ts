"use client";

import { DEFAULT_MODE, MODE_STORAGE_KEY } from "./theme-script";
import { useHtmlAttribute } from "./use-html-attribute";

export type Mode = "skim" | "deep";

export const MODE_LABELS: Record<Mode, string> = {
  skim: "30-second skim",
  deep: "Deep dive",
};

export function useMode(): Mode {
  return useHtmlAttribute<Mode>("data-mode", DEFAULT_MODE);
}

/**
 * Visibility is pure CSS ([data-deep-only] / [data-skim-only] keyed off <html data-mode>),
 * so pages stay statically rendered and correct before hydration. Switching uses the
 * View Transitions API where available for a cross-fade instead of a hard jump.
 */
export function setMode(mode: Mode) {
  const apply = () => {
    document.documentElement.dataset.mode = mode;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // Storage unavailable; mode still applies for this page view.
    }
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduceMotion) doc.startViewTransition(apply);
  else apply();

  // Keep a shareable URL in sync without adding history entries.
  const url = new URL(window.location.href);
  if (url.searchParams.has("mode")) {
    url.searchParams.set("mode", mode);
    window.history.replaceState(null, "", url);
  }
}
