import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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
    <div className="relative border border-border bg-card">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
      />

      <div className="px-6 py-20 md:px-16 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {badge ? (
            <div className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 bg-brand" />
              <span className="label-mono">{badge}</span>
            </div>
          ) : null}

          <h2 className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-4xl lg:text-5xl">
            {title}
          </h2>

          <p className="max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href={primaryHref}
              className="group inline-flex items-center justify-center gap-2 bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
            >
              {primaryLabel}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>

            {secondaryLabel && secondaryHref ? (
              <Link
                href={secondaryHref}
                className="group inline-flex items-center justify-center gap-2 border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                {secondaryLabel}
                <span
                  aria-hidden
                  className="text-brand transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ) : null}
          </div>

          {children}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4 md:px-16">
        <span className="label-mono">Tenviq · Edition 2026</span>
        <span className="label-mono">End · Chapter 09</span>
      </div>
    </div>
  );
}
