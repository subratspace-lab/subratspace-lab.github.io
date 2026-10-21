import Link from "next/link";
import type { ReactNode } from "react";
import { profile } from "@skj/content";
import { buildCommands } from "@/lib/commands";
import { navItems, resumeHref } from "@/lib/site";
import { CommandPalette } from "./CommandPalette";
import { ModeToggle } from "./ModeToggle";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

/** `actions` is an optional slot for page-specific controls. */
export function Header({ actions }: { actions?: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            SKJ
          </span>
          <span className={styles.brandName}>{profile.name}</span>
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <CommandPalette commands={buildCommands(resumeHref)} email={profile.email} />
          <ModeToggle />
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
