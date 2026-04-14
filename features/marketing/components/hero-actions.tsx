import Link from "next/link";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export type HeroActionsProps = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function HeroActions({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: HeroActionsProps) {
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
      <Button asChild size="lg">
        <Link href={primaryHref}>
          {primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>

      {secondaryLabel && secondaryHref ? (
        <Button asChild size="lg" variant="outline">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
