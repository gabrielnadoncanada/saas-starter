import type { Metadata } from "next";
import { Code2, LayoutDashboard, Rocket, Shield } from "lucide-react";

import {
  AnnouncementPill,
  FaqSection,
  FeatureGrid,
  FinalCtaSection,
  Hero,
  HeroActions,
  PricingSection,
  Section,
  SectionHeading,
} from "@/features/marketing/components";

export const metadata: Metadata = {
  title: "Your SaaS — Tagline goes here",
  description:
    "A one-sentence description of what your SaaS does and who it's for. This is shown in search results and social previews.",
};

const featureItems = [
  {
    title: "Ship faster",
    description: "Replace this with a real benefit your product delivers.",
    icon: Rocket,
  },
  {
    title: "Built to scale",
    description: "Replace this with a proof point about reliability or scale.",
    icon: Code2,
  },
  {
    title: "Secure by default",
    description:
      "Replace this with the trust and security angle your buyers care about.",
    icon: Shield,
  },
  {
    title: "Made for teams",
    description:
      "Replace this with how your product works across a team or organization.",
    icon: LayoutDashboard,
  },
];

const pricingPlans = [
  {
    name: "Free",
    description: "For individuals getting started.",
    price: "$0",
    period: "/ month",
    href: "/sign-up",
    ctaLabel: "Start for free",
    features: [
      "1 workspace",
      "Up to 3 members",
      "Core features",
      "Community support",
    ],
  },
  {
    name: "Pro",
    description: "For growing teams shipping real products.",
    price: "$29",
    period: "/ month",
    href: "/sign-up?plan=pro",
    ctaLabel: "Start free trial",
    features: [
      "Unlimited workspaces",
      "Up to 20 members",
      "All features",
      "Priority support",
      "Advanced billing",
    ],
    highlighted: true,
    badge: "Recommended",
  },
  {
    name: "Team",
    description: "For larger teams with advanced needs.",
    price: "$99",
    period: "/ month",
    href: "/sign-up?plan=team",
    ctaLabel: "Start free trial",
    features: [
      "Everything in Pro",
      "Unlimited members",
      "SSO and audit logs",
      "Dedicated support",
      "Custom integrations",
    ],
  },
];

const faqItems = [
  {
    question: "Can I try it before buying?",
    answer:
      "Yes. The Free plan lets you explore the full product surface. Upgrade when you need more seats or advanced features.",
  },
  {
    question: "Do you offer a refund?",
    answer:
      "Replace this with your refund policy — e.g., 14-day no-questions-asked refund, or annual-only refund, or no refund with free trial.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel at any time from your account settings. Billing prorates automatically.",
  },
  {
    question: "How do invites work?",
    answer:
      "Admins can invite teammates by email. Invitees receive a signed link, create an account, and join the workspace automatically.",
  },
];

export default function MarketingPage() {
  return (
    <main className="flex-1">
      <section className="relative">
        <div className="container mx-auto max-w-7xl px-6 pt-20 pb-32 md:px-10 md:pt-28 md:pb-40">
          <Hero
            pill={
              <AnnouncementPill
                label="New"
                text="Replace this with your launch or feature announcement"
                href="#pricing"
              />
            }
            title={<>Your one-line value proposition goes here.</>}
            description={
              <>
                Replace this paragraph with a 2–3 sentence description of what
                you do, who it&apos;s for, and why they should care.
              </>
            }
            actions={
              <HeroActions
                primaryLabel="Get started"
                primaryHref="/sign-up"
                secondaryLabel="Sign in"
                secondaryHref="/sign-in"
                note="Free plan available · No credit card required"
              />
            }
            stack={["Next.js", "TypeScript", "Prisma", "Stripe"]}
          />
        </div>
      </section>

      <Section id="features">
        <SectionHeading
          index="01"
          eyebrow="Features"
          align="center"
          title={<>Everything you need to ship a real product.</>}
          description="Replace this with a short description of the core features your product ships with."
          className="mb-14"
        />
        <FeatureGrid items={featureItems} numbered />
      </Section>

      <Section id="pricing">
        <SectionHeading
          index="02"
          eyebrow="Pricing"
          align="center"
          title={<>Simple pricing. Cancel anytime.</>}
          description="Replace this with a one-line pricing promise."
          className="mb-14"
        />
        <PricingSection plans={pricingPlans} />
      </Section>

      <Section id="faq">
        <SectionHeading
          index="03"
          eyebrow="FAQ"
          align="center"
          title={<>Questions, answered.</>}
          className="mb-14"
        />
        <FaqSection items={faqItems} />
      </Section>

      <Section>
        <FinalCtaSection
          badge="Ready to start"
          title={<>Start building with the starter today.</>}
          description="Replace this with a closing line that restates the value and pushes the reader to act."
          primaryLabel="Create an account"
          primaryHref="/sign-up"
          secondaryLabel="Read docs"
          secondaryHref="/docs"
        />
      </Section>
    </main>
  );
}
