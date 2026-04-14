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
};

export function FeatureGrid({ items, className, children }: FeatureGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {items.map((item) => (
        <FeatureCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          description={item.description}
          children={item.children}
        />
      ))}
      {children}
    </div>
  );
}
