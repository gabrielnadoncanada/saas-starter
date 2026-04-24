import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Eyebrow, H2, SerifAccent } from "./primitives";

type Tier = {
  t: string;
  p: string;
  s: string;
  hl?: boolean;
  cta: string;
  bullets: string[];
};

const tiers: Tier[] = [
  {
    t: "Founding",
    p: "99",
    s: "20 seats · 8 left",
    hl: true,
    cta: "Claim a founding seat →",
    bullets: [
      "Direct input on what ships next",
      "Lifetime updates",
      "Private GitHub access today",
      "Unlimited products",
      "Commercial license",
      "1 developer seat",
    ],
  },
  {
    t: "Early access",
    p: "149",
    s: "Next tier · coming soon",
    cta: "Notify me",
    bullets: [
      "Lifetime updates",
      "Private GitHub access",
      "Unlimited products",
      "Commercial license",
      "1 developer seat",
    ],
  },
  {
    t: "Standard",
    p: "249",
    s: "Permanent price",
    cta: "Notify me",
    bullets: [
      "Lifetime updates",
      "Private GitHub access",
      "Unlimited products",
      "Commercial license",
      "1 developer seat",
    ],
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-y border-border bg-card px-10 py-[110px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow n="07">PRICING</Eyebrow>
        <H2 className="max-w-[820px]">
          One payment. <SerifAccent>Lifetime updates.</SerifAccent>
        </H2>
        <p className="mt-4 max-w-[620px] text-base leading-[1.55] text-muted-foreground">
          The product is production-ready today. The price is early because you
          are. It only goes up.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.t}
              className={cn(
                "relative rounded-[14px] border p-7",
                tier.hl
                  ? "border-brand bg-[#141110] shadow-[0_20px_60px_-20px_hsl(var(--brand-hsl)/0.3)]"
                  : "border-border bg-background",
              )}
            >
              {tier.hl && (
                <div className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-brand-foreground">
                  HELP US LAUNCH
                </div>
              )}
              <div
                className={cn(
                  "font-mono text-[11px] tracking-[0.15em]",
                  tier.hl ? "text-brand" : "text-muted-foreground",
                )}
              >
                {tier.s.toUpperCase()}
              </div>
              <div className="mt-2.5 text-[22px] font-medium">{tier.t}</div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <div
                  className={cn(
                    "text-[22px] font-medium",
                    tier.hl ? "text-brand" : "text-foreground",
                  )}
                >
                  $
                </div>
                <div
                  className={cn(
                    "text-[64px] font-medium leading-none tracking-[-0.05em]",
                    tier.hl ? "text-brand" : "text-foreground",
                  )}
                >
                  {tier.p}
                </div>
                <div className="ml-1.5 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
                  ONE-TIME
                </div>
              </div>
              <div className="mt-5 border-t border-border pt-4">
                {tier.bullets.map((b) => (
                  <div key={b} className="flex gap-2.5 py-1.5 text-[13px]">
                    <span className="shrink-0 font-semibold text-brand">✓</span>
                    <span className="text-foreground">{b}</span>
                  </div>
                ))}
              </div>
              <Button
                className={cn(
                  "mt-5 w-full",
                  tier.hl
                    ? "bg-brand text-brand-foreground hover:bg-brand/90"
                    : "",
                )}
                variant={tier.hl ? "default" : "outline"}
                size="lg"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-9 grid grid-cols-1 gap-3.5 text-[13px] text-muted-foreground md:grid-cols-3">
          <div>
            <strong className="mb-1 block text-foreground">
              Try before you buy.
            </strong>
            Full live demo. Click every button before paying.
          </div>
          <div>
            <strong className="mb-1 block text-foreground">
              Private GitHub access.
            </strong>
            Added to the repo the moment the payment clears.
          </div>
          <div>
            <strong className="mb-1 block text-foreground">
              Lifetime updates.
            </strong>
            Every future release pushed to your repo. No renewals.
          </div>
        </div>
      </div>
    </section>
  );
}
