"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a data-* attribute on <html>. The attribute is set before paint by an
 * inline script, so CSS is already correct; this hook only keeps React UI (labels,
 * aria-pressed) in sync without a hydration mismatch.
 */
export function useHtmlAttribute<T extends string>(name: string, serverValue: T): T {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: [name] });
      return () => observer.disconnect();
    },
    () => (document.documentElement.getAttribute(name) as T | null) ?? serverValue,
    () => serverValue,
  );
}
