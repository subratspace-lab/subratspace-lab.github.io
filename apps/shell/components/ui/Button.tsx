import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type Common = { variant?: Variant; size?: "sm" | "md"; icon?: ReactNode; children: ReactNode };

type ButtonAsLink = Common & { href: string; external?: boolean; download?: boolean } & Omit<
    ComponentProps<"a">,
    "href" | "children"
  >;
type ButtonAsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, "children">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", icon, children, className, ...rest } = props;
  const cls = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
  const content = (
    <>
      <span>{children}</span>
      {icon}
    </>
  );

  if (rest.href !== undefined) {
    const { href, external, download, ...anchor } = rest as ButtonAsLink;
    if (external || download || href.startsWith("mailto:") || href.endsWith(".pdf")) {
      return (
        <a
          href={href}
          className={cls}
          download={download || undefined}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...anchor}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...anchor}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as ButtonAsButton;
  return (
    <button type={type} className={cls} {...button}>
      {content}
    </button>
  );
}
