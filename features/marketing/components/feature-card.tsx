import { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type FeatureCardProps = {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  /** Numeric index auto-filled by FeatureGrid for spec-sheet feel. */
  index?: number;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  children,
  index,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col border border-border bg-background p-8 transition-all hover:border-foreground/60",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-4">
        {Icon ? (
          <div className="flex size-11 items-center justify-center border border-border bg-muted/60 transition-colors group-hover:border-brand group-hover:bg-brand-soft">
            <Icon className="size-5 transition-colors group-hover:text-brand" />
          </div>
        ) : null}

        {typeof index === "number" ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <h3 className="mt-6 text-xl font-semibold leading-tight tracking-[-0.01em]">
        {title}
      </h3>

      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
