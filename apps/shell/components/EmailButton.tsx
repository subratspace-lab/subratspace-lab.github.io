"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MailIcon } from "./icons";
import buttonStyles from "./ui/Button.module.css";
import styles from "./EmailButton.module.css";

type Props = {
  email: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
};

/**
 * A plain mailto: link does nothing on machines without a configured mail client
 * (common on Windows), so this offers copy, Gmail and the system mail app.
 */
export function EmailButton({ email, label = "Email me", variant = "secondary" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback for browsers that block the async clipboard API.
      const input = document.createElement("textarea");
      input.value = email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
  }

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

  return (
    <div
      className={styles.wrap}
      ref={wrapRef}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${buttonStyles.button} ${buttonStyles[variant]} ${buttonStyles.md}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{label}</span>
        <MailIcon />
      </button>

      {open && (
          <div id={panelId} className={styles.panel}>
            <p className={styles.address}>{email}</p>
            <ul className={styles.items}>
              <li>
                <button ref={firstItemRef} type="button" className={styles.item} onClick={copy}>
                  {copied ? "Copied ✓" : "Copy address"}
                </button>
              </li>
              <li>
                <a className={styles.item} href={gmailHref} target="_blank" rel="noopener noreferrer">
                  Open in Gmail
                </a>
              </li>
              <li>
                <a className={styles.item} href={`mailto:${email}`}>
                  Open mail app
                </a>
              </li>
            </ul>
          </div>
        )}
      <span className="visually-hidden" role="status" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}
