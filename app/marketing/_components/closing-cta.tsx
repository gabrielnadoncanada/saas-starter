import { Button } from "@/components/ui/button";

import { SerifAccent } from "./primitives";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-card px-10 pb-24 pt-[110px] text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,hsl(var(--brand-hsl)/0.2),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[820px]">
        <div className="font-mono text-[11px] tracking-[0.2em] text-brand">
          ● 8/20 FOUNDING SEATS LEFT
        </div>
        <h3 className="mt-5 text-balance text-[56px] font-medium leading-[1.05] tracking-[-0.035em]">
          Claim a founding seat at{" "}
          <SerifAccent className="text-brand">$99</SerifAccent>, then build the
          part that&apos;s actually yours.
        </h3>
        <p className="mx-auto mt-5 max-w-[560px] text-base text-muted-foreground">
          Skip the weeks of auth, orgs, billing, admin and AI wiring. Start
          from a base you can actually understand and sell from.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Button
            size="lg"
            className="bg-brand text-brand-foreground shadow-[0_12px_40px_-10px_hsl(var(--brand-hsl)/0.55)] hover:bg-brand/90"
          >
            Claim a founding seat · $99 →
          </Button>
          <Button size="lg" variant="outline">
            Try the live demo
          </Button>
        </div>
      </div>
    </section>
  );
}
