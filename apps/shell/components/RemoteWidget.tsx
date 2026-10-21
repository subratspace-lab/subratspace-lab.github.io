"use client";

import { Component, useEffect, useRef, useState, type ComponentProps, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import type { RemoteModuleId, RemoteModuleMap } from "@skj/contracts";
import styles from "./RemoteWidget.module.css";

/** Tagged with the attempt it belongs to, so a retry reads as "loading" without a sync setState. */
type Status<C> = { attempt: number } & ({ state: "ready"; Comp: C } | { state: "error"; error: Error; kind: "load" | "render" });

class RenderBoundary extends Component<{ children: ReactNode; onError: (e: Error) => void }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[remote] render failed", error, info.componentStack);
    this.props.onError(error);
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Props<Id extends RemoteModuleId> = {
  id: Id;
  props: ComponentProps<RemoteModuleMap[Id]>;
  /** Human-readable name used in loading and error states. */
  label: string;
  /** Reserve space so the page doesn't shift when the remote arrives. */
  minHeight: number;
  /**
   * Defer fetching the remote until it is near the viewport (default). Remote code then
   * never competes with first paint and hydration, and below-the-fold widgets cost nothing
   * until someone scrolls to them.
   */
  lazy?: boolean;
};

/**
 * Loads a federated module on the client and isolates its failures: a missing remote or a
 * crash inside it renders a contained fallback with a retry, never a broken page.
 */
export function RemoteWidget<Id extends RemoteModuleId>({ id, props, label, minHeight, lazy = true }: Props<Id>) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(!lazy);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Status<RemoteModuleMap[Id]> | null>(null);
  const status = result && result.attempt === attempt ? result : { state: "loading" as const };

  useEffect(() => {
    if (nearViewport) return;
    const el = placeholderRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // No observer support: load right away rather than never.
      const t = window.setTimeout(() => setNearViewport(true), 0);
      return () => window.clearTimeout(t);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nearViewport]);

  useEffect(() => {
    if (!nearViewport) return;
    let cancelled = false;
    // The federation runtime is imported on demand: pages pay for it only when a remote is
    // about to be shown, never on initial load.
    import("@/lib/federation/runtime")
      .then(({ loadRemoteModule }) => loadRemoteModule(id))
      .then((Comp) => !cancelled && setResult({ attempt, state: "ready", Comp }))
      .catch((error: Error) => {
        console.error(`[remote] ${id} failed to load`, error);
        if (!cancelled) setResult({ attempt, state: "error", error, kind: "load" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt, nearViewport]);

  if (status.state === "error") {
    return (
      <div className={styles.fallback} style={{ minHeight }} role="alert">
        <p className={styles.fallbackTitle}>{status.kind === "render" ? `${label} crashed.` : `${label} couldn't load.`}</p>
        <p className={styles.fallbackBody}>
          It runs as a separate Module Federation remote, so the rest of this page is unaffected.
        </p>
        <button type="button" className={styles.retry} onClick={() => setAttempt((a) => a + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (status.state === "loading") {
    return (
      <div ref={placeholderRef} className={styles.skeleton} style={{ minHeight }} aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading {label}…</span>
      </div>
    );
  }

  // The registry guarantees id ↔ props agree; TS can't narrow the generic union here.
  const Comp = status.Comp as unknown as ComponentType<Record<string, unknown>>;
  return (
    <div className={styles.mounted} data-remote={id}>
      <RenderBoundary key={attempt} onError={(error) => setResult({ attempt, state: "error", error, kind: "render" })}>
        <Comp {...(props as unknown as Record<string, unknown>)} />
      </RenderBoundary>
    </div>
  );
}
