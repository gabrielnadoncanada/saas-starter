import Link from "next/link";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type HeroActionsProps = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  note?: React.ReactNode;
  className?: string;
};

export function HeroActions({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  note,
  className,
}: HeroActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      <Link
        href={primaryHref}
        className="group relative inline-flex items-center gap-3 bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground shadow-[0_20px_60px_-20px_hsl(var(--brand-hsl)/0.8)] transition-all hover:shadow-[0_30px_80px_-20px_hsl(var(--brand-hsl)/0.9)] hover:-translate-y-0.5"
      >
        <span className="relative z-10">{primaryLabel}</span>
        <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5" />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
      </Link>

      {secondaryLabel && secondaryHref ? (
        <Link
          href={secondaryHref}
          className="group inline-flex items-center gap-2 border border-border bg-background/60 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors hover:border-foreground/60 hover:bg-background"
        >
          {secondaryLabel}
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            →
          </span>
        </Link>
      ) : null}

      {note ? (
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:ml-2">
          {note}
        </div>
      ) : null}
    </div>
  );
}
