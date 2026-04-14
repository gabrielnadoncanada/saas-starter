import * as React from "react";
import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FeatureCardProps = {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  children,
}: FeatureCardProps) {
  return (
    <Card key={title} className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="bg-muted flex size-10 items-center justify-center rounded-md">
              <Icon className="size-5" />
            </div>
          ) : null}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
