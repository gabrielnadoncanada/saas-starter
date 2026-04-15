import * as React from "react";

import {
  FeatureCard,
  FeatureCardProps,
} from "@/features/marketing/components/feature-card";
import { cn } from "@/lib/utils";

export type FeatureGridProps = {
  items: FeatureCardProps[];
  className?: string;
  children?: React.ReactNode;
  /** If true, cards show their numeric position as a mono label (01, 02, …). */
  numbered?: boolean;
};

export function FeatureGrid({
  items,
  className,
  children,
  numbered = false,
}: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid gap-px bg-border md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {items.map((item, i) => (
        <FeatureCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          description={item.description}
          index={numbered ? i : undefined}
          className={cn("bg-background", item.className)}
        >
          {item.children}
        </FeatureCard>
      ))}
      {children}
    </div>
  );
}
