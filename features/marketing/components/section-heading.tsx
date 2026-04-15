import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  /** Deprecated display hint. Prefer `eyebrow` on the parent Section. */
  badge?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
  /** If set, shown as a small mono-style kicker above the title. */
  kicker?: string;
};

export function SectionHeading({
  badge,
  title,
  description,
  align = "left",
  className,
  children,
  kicker,
}: SectionHeadingProps) {
  const isCentered = align === "center";
  const label = kicker ?? badge;

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        isCentered && "items-center text-center",
        className,
      )}
    >
      {label ? (
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span
            className="size-1.5 bg-brand animate-brand-pulse"
            aria-hidden
          />
          {label}
        </span>
      ) : null}

      <div className="space-y-6">
        <h2
          className={cn(
            "text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-6xl",
            isCentered && "mx-auto max-w-3xl",
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={cn(
              "max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg",
              isCentered && "mx-auto",
            )}
          >
            {description}
          </p>
        ) : null}

        {children}
      </div>
    </div>
  );
}
