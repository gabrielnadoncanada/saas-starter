import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export type AnnouncementPillProps = {
  label: string;
  text: string;
  href?: string;
  className?: string;
};

export function AnnouncementPill({
  label,
  text,
  href,
  className,
}: AnnouncementPillProps) {
  const content = (
    <>
      <span className="flex items-center gap-2 border-r border-border/80 pr-3 font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
        <span
          className="size-1.5 bg-brand animate-brand-pulse"
          aria-hidden
        />
        {label}
      </span>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
        {text}
      </span>
      {href ? (
        <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      ) : null}
    </>
  );

  const baseClasses = cn(
    "group inline-flex items-center gap-3 border border-border bg-background/60 backdrop-blur px-3 py-1.5 text-xs shadow-[0_1px_0_hsl(0_0%_100%/0.5)_inset] transition-colors hover:border-foreground/40",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
