"use client";

import { useEffect, useRef, useState } from "react";

const NUMBER = /\d+(?:\.\d+)?/g;

function withProgress(text: string, t: number): string {
  return text.replace(NUMBER, (n) => {
    const value = Number(n) * t;
    return n.includes(".") ? value.toFixed(1) : String(Math.round(value));
  });
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts every number in a display string (e.g. "62 → 88", "~30%") up from zero when it
 * enters the viewport. The server renders the final text and screen readers always get it.
 * Plain IntersectionObserver + rAF (no animation library) to keep it off the critical path.
 */
export function CountUp({ text, duration = 1100 }: { text: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Skip for reduced motion, and in hidden tabs where rAF is paused (it would sit at zero).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.visibilityState !== "visible") return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setDisplay(withProgress(text, easeOutExpo(t)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text, duration]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {display}
      </span>
      <span className="visually-hidden">{text}</span>
    </>
  );
}
