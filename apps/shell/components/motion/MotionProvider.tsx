"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Animation features load in their own chunk after hydration, so they never sit on the
// critical path. Until they arrive, `m` components render their final state without motion.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/**
 * LazyMotion + `m` components keep Framer Motion's footprint small.
 * reducedMotion="user" turns transform animations off when the OS asks for it.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
