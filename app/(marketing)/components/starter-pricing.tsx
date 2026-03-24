import { Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

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
    name: 'Starter',
    price: 149,
    tagline: 'The core foundation for solo builders.',
    bestFor: 'Solo founders and indie developers who want the codebase and are comfortable customizing it themselves.',
    features: [
      'Full source code — Next.js 16, React 19, TypeScript',
      'Auth: magic link, Google, GitHub OAuth',
      'Stripe billing: flat, per-seat, and one-time',
      'Plan gating with capability checks and usage limits',
      'Team management with roles and invitations',
      'Dashboard shell with sidebar and settings',
      'Tasks CRUD example with plan-gated creation',
      'AI-ready assistant module with real task actions and honest scaffolds',
      'PostgreSQL + Prisma with migrations and seed',
      'Email templates with Resend',
      '72 documentation files including 31 customization guides',
      'MIT license — use for one commercial product',
    ],
    cta: 'Get the Starter',
  },
  {
    name: 'Pro',
    price: 299,
    tagline: 'The fastest path from starter to launch.',
    bestFor: 'Founders launching a real product who want more polish, less assembly, and a stronger starting position.',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Everything in Starter, plus:',
      'Priority email support for 6 months',
      'Extended implementation guides',
      'Additional page templates and UI blocks',
      'Advanced billing patterns and examples',
      'Lifetime access to minor updates',
    ],
    cta: 'Get Pro',
  },
  {
    name: 'Agency',
    price: 599,
    tagline: 'Built for repeat delivery across client projects.',
    bestFor: 'Agencies, consultants, and studios using the starter across multiple client or internal builds.',
    features: [
      'Everything in Pro, plus:',
      'Agency license — use across unlimited client projects',
      'Multi-project commercial rights',
      'Priority support for 12 months',
    ],
    cta: 'Get Agency',
  },
];

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 ${
        tier.highlighted
          ? 'border-orange-500 ring-1 ring-orange-500 shadow-md'
          : 'border-border'
      }`}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
          {tier.badge}
        </span>
      )}
      <div>
        <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
      </div>
      <p className="mt-4 text-4xl font-semibold text-foreground">
        ${tier.price}
        <span className="ml-1 text-base font-normal text-muted-foreground">
          one-time
        </span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">{tier.bestFor}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <a href="#purchase" className="block">
          <Button
            size="lg"
            className={`w-full rounded-full text-base ${
              tier.highlighted ? '' : 'bg-foreground text-background hover:bg-foreground/90'
            }`}
            variant={tier.highlighted ? 'default' : 'outline'}
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
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            One purchase. Full source code. Ship this week.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            No subscriptions. No recurring fees. Buy once, own the code, build
            your product.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
          All tiers include lifetime access to the purchased version. 30-day
          refund policy — if the code doesn't match what's described, get your
          money back.
        </p>
      </div>
    </section>
  );
}
