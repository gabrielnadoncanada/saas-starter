import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  containerClassName?: string;
  /** Optional mono-style index label shown top-left (e.g. "01"). */
  index?: string;
  /** Optional mono-style label shown next to the index (e.g. "POSITIONING"). */
  eyebrow?: string;
  /** Render a subtle grid background behind the section. */
  grid?: boolean;
  /** Variant controls surface color. */
  variant?: "default" | "muted" | "inverted";
};

export function Section({
  className,
  containerClassName,
  children,
  index,
  eyebrow,
  grid,
  variant = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative isolate scroll-mt-24 border-t border-border/60",
        variant === "muted" && "bg-muted/40",
        variant === "inverted" &&
          "bg-foreground text-background border-foreground",
        className,
      )}
      {...props}
    >
      {grid ? (
        <div
          aria-hidden
          className={cn(
            "bg-grid pointer-events-none absolute inset-0 opacity-[0.06]",
            variant === "inverted" ? "text-background" : "text-foreground",
          )}
        />
      ) : null}

      <div
        className={cn(
          "container relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28",
          containerClassName,
        )}
      >
        {index || eyebrow ? (
          <div
            className={cn(
              "mb-12 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em]",
              variant === "inverted"
                ? "text-background/60"
                : "text-muted-foreground",
            )}
          >
            {index ? (
              <span
                className={cn(
                  "tabular-nums",
                  variant === "inverted" ? "text-background" : "text-foreground",
                )}
              >
                {index.padStart(2, "0")}
              </span>
            ) : null}
            <span
              className={cn(
                "h-px flex-none w-10",
                variant === "inverted" ? "bg-background/30" : "bg-border",
              )}
              aria-hidden
            />
            {eyebrow ? <span>{eyebrow}</span> : null}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}
