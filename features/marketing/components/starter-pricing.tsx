import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MARKETING_DOC_COUNT } from "@/features/marketing/site";

const purchaseUrl =
  process.env.NEXT_PUBLIC_STARTER_PURCHASE_URL?.trim() || "#pricing";

type Tier = {
  name: string;
  price: number;
  tagline: string;
  bestFor: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: 149,
    tagline: "The core foundation for solo builders.",
    bestFor:
      "Solo founders and indie developers who want the codebase and are comfortable customizing it themselves.",
    features: [
      "Full source code — Next.js 16, React 19, TypeScript",
      "Auth: magic link, Google, GitHub OAuth",
      "Stripe billing: flat-rate monthly and yearly subscriptions",
      "Plan gating with capability checks and usage limits",
      "Team management with roles and invitations",
      "Dashboard shell with sidebar and settings",
      "Tasks CRUD example with plan-gated creation",
      "AI-ready assistant module with real task actions and honest scaffolds",
      "PostgreSQL + Prisma with migrations and seed",
      "Email templates with Resend",
      `${MARKETING_DOC_COUNT} focused docs for setup, customization, billing, deployment, and extension`,
      "Tenviq Commercial License — see LICENSE in the repo",
    ],
    cta: "Get the Starter",
  },
  {
    name: "Pro",
    price: 299,
    tagline: "The fastest path from starter to launch.",
    bestFor:
      "Founders launching a real product who want more polish, less assembly, and a stronger starting position.",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter, plus:",
      "Priority email support for 6 months",
      "Extended implementation guides",
      "Additional page templates and UI blocks",
      "Advanced billing patterns and examples",
      "Lifetime access to minor updates",
    ],
    cta: "Get Pro",
  },
  {
    name: "Agency",
    price: 599,
    tagline: "Built for repeat delivery across client projects.",
    bestFor:
      "Agencies, consultants, and studios using the starter across multiple client or internal builds.",
    features: [
      "Everything in Pro, plus:",
      "Agency license — use across unlimited client projects",
      "Multi-project commercial rights",
      "Priority support for 12 months",
    ],
    cta: "Get Agency",
  },
];

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 ${
        tier.highlighted
          ? "border-violet-500/50 bg-violet-500/[0.03] shadow-xl shadow-violet-500/10 scale-[1.02]"
          : "border-border/60 bg-card/60 hover:border-border"
      }`}
    >
      {tier.badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/25">
          {tier.badge}
        </span>
      )}
      <div>
        <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
      </div>
      <p className="mt-6">
        <span className="text-5xl font-bold tracking-tight text-foreground">
          ${tier.price}
        </span>
        <span className="ml-2 text-sm text-muted-foreground">one-time</span>
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {tier.bestFor}
      </p>
      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
              <Check className="h-3 w-3 text-violet-500" />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <a
          href={purchaseUrl}
          className="block"
          {...(purchaseUrl.startsWith("http")
            ? { target: "_blank" as const, rel: "noopener noreferrer" }
            : {})}
        >
          <Button
            size="lg"
            className={`w-full rounded-full text-base ${
              tier.highlighted
                ? "shadow-lg shadow-violet-500/20"
                : ""
            }`}
            variant={tier.highlighted ? "default" : "outline"}
          >
            {tier.cta}
          </Button>
        </a>
      </div>
    </div>
  );
}

export function StarterPricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-500">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            One purchase. Full source code. Ship this week.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            No subscriptions. No recurring fees. Buy once, own the code, build
            your product.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground">
          All tiers include lifetime access to the purchased version. 30-day
          refund policy — if the code doesn&apos;t match what&apos;s described,
          get your money back.
        </p>
      </div>
    </section>
  );
}
