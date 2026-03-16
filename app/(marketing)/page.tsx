import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import {
  ArrowRight,
  CreditCard,
  Database,
  LayoutDashboard,
  Lock,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

import type { Metadata } from 'next';

import { CodeProof } from './components/code-proof';
import { StarterPricing } from './components/starter-pricing';
import { ScreenshotsGallery } from './components/screenshots-gallery';
import { ComparisonSection } from './components/comparison-section';
import { BuilderSection } from './components/builder-section';
import { BuyerFaq } from './components/buyer-faq';

export const metadata: Metadata = {
  title:
    'SaaS Starter — Next.js starter with auth, billing, and enforced plan gating',
  description:
    'The Next.js SaaS starter where billing actually controls your product. Auth, Stripe, plan gating with capability checks and usage limits, teams, and a polished dashboard. Built for technical founders.',
  openGraph: {
    title: 'SaaS Starter — Auth, billing, and plan gating that actually works',
    description:
      'Gate features and enforce usage limits in two lines of code. Next.js 16, React 19, TypeScript, Stripe, Prisma. Buy once, own the code.',
    type: 'website',
  },
};

const features = [
  {
    icon: Shield,
    title: 'Plan Gating',
    description:
      'Capability-based feature flags and usage limits. Gate any feature or enforce quotas in two lines. This is what other starters leave you to build.',
  },
  {
    icon: CreditCard,
    title: 'Stripe Billing',
    description:
      'Subscriptions, one-time payments, per-seat billing, checkout, customer portal, and webhook handling. Three pricing models out of the box.',
  },
  {
    icon: Lock,
    title: 'Authentication',
    description:
      'Magic link, Google, and GitHub OAuth. Account linking, session management, and soft delete built in.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description:
      'Multi-team support with roles, invitations, and team switching. Plan-enforced member limits. Ready for B2B from day one.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Shell',
    description:
      'Sidebar navigation, command menu, dark mode, responsive layout, and a full settings experience.',
  },
  {
    icon: Database,
    title: 'Database + ORM',
    description:
      'PostgreSQL with Prisma. Migrations, seed scripts, and a clean schema split by feature.',
  },
  {
    icon: Settings,
    title: 'Settings + Account',
    description:
      'Profile editing, linked auth providers, activity log, account deletion, and team management pages.',
  },
  {
    icon: ArrowRight,
    title: 'CRUD Example',
    description:
      'Full tasks module with TanStack Table, server actions, Zod validation, and plan-gated creation. The exact pattern to replicate for your features.',
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              The Next.js starter with billing{' '}
              <span className="text-orange-500">
                and plan gating
              </span>{' '}
              built in
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Other starters connect Stripe and stop. This one ships enforced
              plan gating — capability checks, usage limits, and feature
              access control tied to billing. Gate any feature in two lines.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="#pricing">
                <Button
                  size="lg"
                  className="w-full rounded-full text-lg sm:w-auto"
                >
                  View Pricing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#screenshots">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full text-lg sm:w-auto"
                >
                  See What's Included
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Next.js 16 &middot; React 19 &middot; TypeScript &middot;
              Tailwind v4 &middot; Prisma &middot; Stripe &middot; $149
              one-time
            </p>
          </div>
        </div>
      </section>

      {/* Plan gating proof — the wedge */}
      <CodeProof />

      {/* Features grid */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to launch — nothing you need to learn
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
              Feature-organized code, not a custom framework. Read it, modify
              it, delete what you don't need. No abstractions to learn first.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <ScreenshotsGallery />

      {/* Comparison */}
      <ComparisonSection />

      {/* What's included summary */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              What you get
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              One purchase. Full source code. Everything below is included.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: 'Source code',
                detail:
                  'Next.js 16, React 19, TypeScript strict, Tailwind v4, shadcn/ui',
              },
              {
                label: 'Auth system',
                detail:
                  'Magic link, Google, GitHub OAuth, account linking, session management',
              },
              {
                label: 'Billing system',
                detail:
                  'Stripe checkout, webhooks, customer portal, 3 pricing models',
              },
              {
                label: 'Plan gating',
                detail:
                  'Capability checks, usage limits, upgrade prompts, centralized config',
              },
              {
                label: 'Team layer',
                detail: 'Roles, invitations, team switching, member limits',
              },
              {
                label: 'Dashboard',
                detail:
                  'Sidebar, command menu, dark mode, settings, activity log',
              },
              {
                label: 'CRUD example',
                detail:
                  'Tasks with TanStack Table, server actions, Zod, plan-gated creation',
              },
              {
                label: 'Database',
                detail:
                  'PostgreSQL + Prisma, migrations, seed script, feature-split schema',
              },
              {
                label: '72 docs',
                detail:
                  'Setup, architecture, 31 customization guides, troubleshooting',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack bar */}
      <section id="stack" className="border-t py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
            Built with the modern stack you already know
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {[
              'Next.js 16',
              'React 19',
              'TypeScript',
              'Tailwind CSS 4',
              'shadcn/ui',
              'Prisma',
              'PostgreSQL',
              'Stripe',
              'NextAuth v5',
              'Resend',
            ].map((tech) => (
              <span key={tech} className="font-medium text-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <StarterPricing />

      {/* Builder */}
      <BuilderSection />

      {/* FAQ */}
      <BuyerFaq />

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Stop rebuilding. Start shipping.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Auth, billing, plan gating, teams, and 72 docs. Buy once, own the
              code, launch your SaaS this week.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="#pricing">
                <Button
                  size="lg"
                  className="w-full rounded-full text-lg sm:w-auto"
                >
                  Get the Starter — $149
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              One-time purchase &middot; Full source code &middot; 30-day
              refund policy
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
