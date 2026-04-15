import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  containerClassName?: string;
  /** Render a subtle grid background behind the section. */
  grid?: boolean;
  /** Variant controls surface color. */
  variant?: "default" | "muted" | "inverted";
};

export function Section({
  className,
  containerClassName,
  children,
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
        {children}
      </div>
    </section>
  );
}
