import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card>
      <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center md:px-10">
        <div className="max-w-2xl space-y-3">
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>

          {secondaryLabel && secondaryHref ? (
            <Button asChild size="lg" variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
