import Link from "next/link";
import * as React from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  period?: string;
  href: string;
  ctaLabel: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
};

export type PricingSectionProps = {
  plans: PricingPlan[];
  className?: string;
};

export function PricingSection({ plans, className }: PricingSectionProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-3", className)}>
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={plan.highlighted ? "border-primary shadow-sm" : undefined}
        >
          <CardHeader className="space-y-4">
            {plan.badge ? (
              <div className="flex min-h-6 items-center">
                <Badge>{plan.badge}</Badge>
              </div>
            ) : null}

            <div className="space-y-2">
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-muted-foreground text-sm leading-6">
                {plan.description}
              </p>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold tracking-tight">
                {plan.price}
              </span>
              {plan.period ? (
                <span className="text-muted-foreground pb-1 text-sm">
                  {plan.period}
                </span>
              ) : null}
            </div>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="text-primary mt-0.5 size-4" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              asChild
              className="w-full"
              variant={plan.highlighted ? "default" : "outline"}
            >
              <Link href={plan.href}>{plan.ctaLabel}</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
