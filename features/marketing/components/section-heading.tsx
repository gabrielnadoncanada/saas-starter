import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  badge?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
};

export function SectionHeading({
  badge,
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
        "flex flex-col gap-4",
        isCentered && "items-center text-center",
        className,
      )}
    >
      {badge ? <Badge variant="outline">{badge}</Badge> : null}

      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h2>

        {description ? (
          <p
            className={cn(
              "text-muted-foreground max-w-2xl text-base md:text-lg",
              {
                "mx-auto": isCentered,
              },
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
