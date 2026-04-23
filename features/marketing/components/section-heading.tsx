import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  index?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        isCentered && "items-center text-center",
        className,
      )}
    >
      {index || eyebrow ? (
        <div className="mb-2 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {index ? (
            <span className="tabular-nums text-foreground">
              {index.padStart(2, "0")}
            </span>
          ) : null}
          <span className="h-px w-10 flex-none bg-border" aria-hidden />
          {eyebrow ? <span>{eyebrow}</span> : null}
        </div>
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
