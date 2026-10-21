"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { filterCommands, type Command } from "@/lib/command-search";
import { setMode } from "@/lib/mode";
import { setTheme } from "./ThemeToggle";
import { SearchIcon } from "./icons";
import styles from "./CommandPalette.module.css";

const noop = () => () => {};
const useIsMac = () =>
  useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

/**
 * Ctrl/Cmd+K palette. A native <dialog> gives a real modal (focus trap, Escape, inert
 * background); the input + listbox follow the ARIA combobox pattern with
 * aria-activedescendant, so focus never leaves the input while arrowing through results.
 */
type Props = {
  /** Built on the server from content (lib/commands.ts), so the client never imports it. */
  commands: Command[];
  email: string;
};

export function CommandPalette({ commands, email }: Props) {
  const router = useRouter();
  const isMac = useIsMac();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState("");

  const results = useMemo(() => filterCommands(commands, query), [commands, query]);
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  // The native <dialog> is the single source of truth for open/closed; React state only
  // mirrors it (via the "close" event) so Escape, backdrop clicks and runs can't drift.
  const show = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    setOpen(true);
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  const hide = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) hide();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, hide]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const run = async (cmd: Command) => {
    hide();
    const a = cmd.action;
    switch (a.type) {
      case "navigate":
        router.push(a.href);
        break;
      case "mode":
        setMode(a.mode);
        setToast(a.mode === "skim" ? "Switched to the 30-second skim" : "Switched to deep dive");
        break;
      case "theme":
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
        break;
      case "copy-email":
        try {
          await navigator.clipboard.writeText(email);
          setToast(`Copied ${email}`);
        } catch {
          setToast(email);
        }
        break;
      case "external":
        window.open(a.href, "_blank", "noopener,noreferrer");
        break;
      case "download": {
        const link = document.createElement("a");
        link.href = a.href;
        link.download = "";
        link.click();
        break;
      }
    }
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (Math.min(i, results.length - 1) + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (Math.min(i, results.length - 1) - 1 + results.length) % results.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(results.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[activeIndex];
      if (cmd) void run(cmd);
    }
  };

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, listId]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={show}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        data-testid="palette-trigger"
      >
        <SearchIcon size={16} />
        <span className={styles.triggerLabel}>Jump to</span>
        <kbd className={styles.triggerKbd} suppressHydrationWarning>
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
        <span className="visually-hidden">Open command palette</span>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Command palette"
        onClick={(e) => {
          // Click on the backdrop (the dialog element itself) closes it.
          if (e.target === dialogRef.current) hide();
        }}
      >
        {/* Always mounted so showModal() can focus the input synchronously. */}
        <div className={styles.panel}>
            <div className={styles.inputRow}>
              <SearchIcon size={18} />
              <input
                ref={inputRef}
                className={styles.input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search pages, case studies, actions…"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={results.length ? `${listId}-${activeIndex}` : undefined}
                aria-label="Search commands"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className={styles.esc}>Esc</kbd>
            </div>

            <ul id={listId} role="listbox" aria-label="Results" className={styles.list}>
              {results.length === 0 && (
                <li className={styles.empty} role="presentation">
                  Nothing matches “{query}”.
                </li>
              )}
              {results.map((cmd, i) => {
                const showGroup = !query && (i === 0 || results[i - 1]?.group !== cmd.group);
                return (
                  <li key={cmd.id} role="presentation">
                    {showGroup && (
                      <div className={styles.group} aria-hidden="true">
                        {cmd.group}
                      </div>
                    )}
                    <div
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      className={styles.option}
                      onMouseMove={() => i !== activeIndex && setActive(i)}
                      onClick={() => void run(cmd)}
                    >
                      <span className={styles.optionTitle}>{cmd.title}</span>
                      {cmd.subtitle && <span className={styles.optionSub}>{cmd.subtitle}</span>}
                      <span className={styles.optionGroup}>{cmd.group}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className={styles.footer} aria-hidden="true">
              <span>
                <kbd>↑</kbd> <kbd>↓</kbd> to move
              </span>
              <span>
                <kbd>Enter</kbd> to run
              </span>
              <span>
                <kbd>Esc</kbd> to close
              </span>
            </p>
        </div>
      </dialog>

      <div className={styles.toast} role="status" aria-live="polite" data-visible={toast ? "" : undefined}>
        {toast}
      </div>
    </>
  );
}
