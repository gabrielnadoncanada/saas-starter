import { Check } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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
  const layoutClassName =
    plans.length === 1
      ? "mx-auto max-w-xl"
      : plans.length === 2
        ? "lg:grid-cols-2"
        : "lg:grid-cols-3";

  return (
    <div
      className={cn(
        "grid gap-px border border-border bg-border",
        layoutClassName,
        className,
      )}
    >
      {plans.map((plan, i) => (
        <PricingCard key={plan.name} plan={plan} index={i} />
      ))}
    </div>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { highlighted } = plan;
  const isExternal = /^https?:\/\//.test(plan.href);

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-background p-8 transition-colors",
        highlighted &&
          "lg:-my-4 lg:z-10 bg-background shadow-[0_40px_80px_-30px_hsl(var(--brand-hsl)/0.35)] ring-1 ring-brand",
      )}
    >
      {highlighted ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-soft/40 via-transparent to-transparent"
        />
      ) : null}

      {highlighted ? (
        <div className="absolute -top-3 left-8 flex items-center gap-2 bg-brand px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-brand-foreground">
          <span className="size-1 bg-brand-foreground" aria-hidden />
          {plan.badge ?? "Recommended"}
        </div>
      ) : null}

      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Plan {String(index + 1).padStart(2, "0")}
        </span>
        {!highlighted && plan.badge ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <h3 className="relative mt-6 text-2xl font-semibold tracking-tight">
        {plan.name}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
        {plan.description}
      </p>

      <div className="relative mt-8 flex items-end gap-2 border-b border-border pb-8">
        <span
          className={cn(
            "text-5xl font-semibold tracking-[-0.03em] tabular-nums",
            highlighted && "text-brand",
          )}
        >
          {plan.price}
        </span>
        {plan.period ? (
          <span className="pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {plan.period}
          </span>
        ) : null}
      </div>

      <ul className="relative mt-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center border",
                highlighted
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-muted/60",
              )}
            >
              <Check
                className={cn(
                  "size-3",
                  highlighted ? "text-brand" : "text-foreground/70",
                )}
                strokeWidth={2.5}
              />
            </span>
            <span className="leading-relaxed text-foreground/90">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        {...(isExternal
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
        className={cn(
          "relative mt-10 group/cta inline-flex items-center justify-between gap-2 border px-5 py-3.5 text-sm font-medium transition-all",
          highlighted
            ? "border-transparent bg-brand text-brand-foreground shadow-[0_20px_40px_-15px_hsl(var(--brand-hsl)/0.8)] hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-15px_hsl(var(--brand-hsl)/0.9)]"
            : "border-border bg-background hover:border-foreground",
        )}
      >
        <span>{plan.ctaLabel}</span>
        <span
          className={cn(
            "transition-transform group-hover/cta:translate-x-0.5",
            highlighted ? "text-brand-foreground" : "text-brand",
          )}
        >
          →
        </span>
      </Link>
    </div>
  );
}
