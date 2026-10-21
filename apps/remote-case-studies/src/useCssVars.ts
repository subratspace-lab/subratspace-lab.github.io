import { useEffect, useState } from "react";

/**
 * Recharts writes colors as SVG attributes, where var() doesn't resolve. Read the shell's
 * design tokens instead and re-read whenever the theme attribute on <html> changes.
 */
export function useCssVars<K extends string>(names: readonly K[], fallback: Record<K, string>): Record<K, string> {
  const [values, setValues] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const next = {} as Record<K, string>;
      for (const n of names) next[n] = style.getPropertyValue(`--${n}`).trim() || fallback[n];
      setValues(next);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
    // names/fallback are static per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return values;
}

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}
