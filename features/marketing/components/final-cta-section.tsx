import Link from "next/link";
import * as React from "react";
import { ArrowRight } from "lucide-react";

export type FinalCtaSectionProps = {
  badge?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  children?: React.ReactNode;
};

export function FinalCtaSection({
  badge,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  children,
}: FinalCtaSectionProps) {
  return (
    <div className="relative overflow-hidden border border-border bg-foreground text-background dark:bg-background dark:text-foreground">
      <div
        aria-hidden
        className="bg-grid absolute inset-0 text-background opacity-[0.05] dark:text-foreground"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand/40 blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
      />

      <div className="relative flex flex-col items-center gap-8 px-6 py-24 text-center md:px-16 md:py-32">
        {badge ? (
          <span className="inline-flex items-center gap-2 border border-background/20 bg-background/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-background/80 backdrop-blur dark:border-foreground/20 dark:bg-foreground/5 dark:text-foreground/80">
            <span
              className="size-1.5 bg-brand animate-brand-pulse"
              aria-hidden
            />
            {badge}
          </span>
        ) : null}

        <div className="max-w-3xl space-y-6">
          <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-base leading-relaxed text-background/70 md:text-lg dark:text-foreground/70">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="group relative inline-flex items-center gap-3 bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground shadow-[0_20px_60px_-20px_hsl(var(--brand-hsl)/0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-20px_hsl(var(--brand-hsl)/0.9)]"
          >
            {primaryLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {secondaryLabel && secondaryHref ? (
            <Link
              href={secondaryHref}
              className="group inline-flex items-center gap-2 border border-background/20 bg-background/5 px-6 py-3.5 text-sm font-medium text-background backdrop-blur transition-colors hover:border-background/60 hover:bg-background/10 dark:border-foreground/20 dark:bg-foreground/5 dark:text-foreground dark:hover:border-foreground/60 dark:hover:bg-foreground/10"
            >
              {secondaryLabel}
              <span className="text-brand transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
