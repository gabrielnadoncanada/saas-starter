import {
  Code2,
  CreditCard,
  LayoutDashboard,
  Lock,
  Rocket,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  AnnouncementPill,
  CheckList,
  FaqSection,
  FeatureGrid,
  FinalCtaSection,
  Hero,
  HeroActions,
  LogoCloud,
  PricingSection,
  Section,
  SectionHeading,
  SplitShowcase,
} from "@/features/marketing/components";

const featureItems = [
  {
    title: "Ship faster",
    description:
      "Skip weeks of repetitive setup work and start from a real SaaS foundation.",
    icon: Rocket,
  },
  {
    title: "Understand faster",
    description:
      "Open the project and quickly see where things live, how flows work, and where to make changes.",
    icon: Code2,
  },
  {
    title: "Modify safely",
    description:
      "Add features, edit flows, and extend the product without fighting hidden conventions.",
    icon: Shield,
  },
  {
    title: "Launch with credibility",
    description:
      "Start from product surfaces that already feel real to users, customers, and buyers.",
    icon: LayoutDashboard,
  },
];

const includedBlocks = [
  {
    title: "Core foundations",
    icon: Shield,
    children: [
      <CheckList
        key="core-foundations"
        items={[
          "Authentication flows",
          "Protected application area",
          "Account management",
          "Product-ready settings foundation",
          "Database-backed structure",
        ]}
      />,
    ],
  },
  {
    title: "Monetization",
    icon: CreditCard,
    children: [
      <CheckList
        key="monetization"
        items={[
          "Subscription billing",
          "Plan structure",
          "Feature gating foundation",
          "Usage limit extensibility",
          "Billing-ready product model",
        ]}
      />,
    ],
  },
  {
    title: "SaaS structure",
    icon: Users,
    children: [
      <CheckList
        key="saas-structure"
        items={[
          "Dashboard shell",
          "Team and workspace support",
          "Navigation foundations",
          "Extendable product architecture",
          "Real app starting point",
        ]}
      />,
    ],
  },
  {
    title: "Developer experience",
    icon: Code2,
    children: [
      <CheckList
        key="developer-experience"
        items={[
          "Predictable file ownership",
          "Obvious naming patterns",
          "Straightforward feature extension",
          "Low-ceremony code organization",
          "Documentation for setup and customization",
        ]}
      />,
    ],
  },
];

const proofBlocks = [
  {
    title: "Add a feature",
    description:
      "Create the schema, add the page, connect the action, and ship without wiring a mini-framework.",
    children: [
      <CheckList
        key="add-a-feature"
        items={["Create schema", "Add page", "Connect action", "Ship"]}
      />,
    ],
  },
  {
    title: "Extend billing",
    description:
      "Adjust plans, update feature gating, and evolve monetization without hunting through layers.",
    children: [
      <CheckList
        key="extend-billing"
        items={["Adjust plan", "Update gating", "Review limits", "Go live"]}
      />,
    ],
  },
  {
    title: "Customize settings",
    description:
      "Edit account and workspace flows where you expect them, with direct ownership and fewer jumps.",
    children: [
      <CheckList
        key="customize-settings"
        items={["Edit section", "Save flow", "Validate UI", "Done"]}
      />,
    ],
  },
];

const comparisonBlocks = [
  {
    title: "Other boilerplates",
    description:
      "Often save too little time and still need lots of rebuilding.",
    children: [
      <CheckList
        key="other-boilerplates"
        items={[
          "Save too little time",
          "Look unfinished",
          "Need lots of rebuilding",
          "Weak monetization foundations",
          "Poor launch credibility",
        ]}
      />,
    ],
  },
  {
    title: "Heavy starters",
    description:
      "Look complete, but cost more time to understand and customize.",
    children: [
      <CheckList
        key="heavy-starters"
        items={[
          "Harder to understand",
          "Too much ceremony",
          "Too many internal patterns",
          "Slower to customize",
          "Higher cognitive load",
        ]}
      />,
    ],
  },
  {
    title: "This starter",
    description: "Built for real buyer needs, with a stronger launch-ready base.",
    className:
      "relative border-brand ring-2 ring-brand bg-gradient-to-br from-brand-soft/60 via-background to-background shadow-[0_30px_80px_-30px_hsl(var(--brand-hsl)/0.5)]",
    children: [
      <CheckList
        key="this-starter"
        items={[
          "Strong launch-ready base",
          "Clear product foundations",
          "Faster time to understand",
          "Faster time to modify",
          "Built for real buyer needs",
        ]}
      />,
    ],
  },
];

const extraContextBlocks = [
  {
    title: "Use it to build",
    icon: Lock,
    description:
      "Start from a foundation that already solves the expensive, repetitive parts.",
    children: [
      <CheckList
        key="use-it-to-build"
        items={[
          "B2B SaaS products",
          "Client portals",
          "AI-powered SaaS tools",
          "Internal business software",
          "Niche vertical products",
          "Paid MVPs with real monetization foundations",
        ]}
      />,
    ],
  },
  {
    title: "A better starter is not the one with the most layers",
    icon: ShieldCheck,
    description:
      "It is the one that helps you launch with less hesitation and faster progress.",
    children: [
      <CheckList
        key="starter-philosophy"
        items={[
          "Obviousness over purity",
          "Boundaries without ceremony",
          "Complexity only where it is earned",
          "Visible value over invisible sophistication",
        ]}
      />,
    ],
  },
];

const pricingPlans = [
  {
    name: "Starter",
    description: "For solo founders shipping a focused SaaS fast.",
    price: "$49",
    period: "one-time",
    href: "/auth/sign-up",
    ctaLabel: "Buy Starter",
    features: [
      "Auth and protected dashboard",
      "Billing foundation",
      "Settings and account flows",
      "Marketing landing page",
    ],
    badge: "Simple",
  },
  {
    name: "Pro",
    description:
      "For consultants and small teams building client-facing products.",
    price: "$149",
    period: "one-time",
    href: "/auth/sign-up",
    ctaLabel: "Buy Pro",
    features: [
      "Everything in Starter",
      "Teams and workspace support",
      "Feature gating foundation",
      "Example product patterns",
    ],
    badge: "Best value",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For repeated client delivery and internal acceleration.",
    price: "$349",
    period: "one-time",
    href: "/contact",
    ctaLabel: "Contact Sales",
    features: [
      "Everything in Pro",
      "Extended usage rights",
      "Priority support",
      "Launch help",
    ],
    badge: "Teams",
  },
];

const faqItems = [
  {
    question: "Who is this for?",
    answer:
      "This starter is built for solo founders, consultants, freelancers, indie hackers, and small technical teams who want a fast path to a launchable SaaS.",
  },
  {
    question: "Is this just a boilerplate?",
    answer:
      "No. It is a product-ready SaaS foundation designed to save meaningful time on the parts builders repeatedly rebuild: auth, billing, dashboard structure, settings, and core product flows.",
  },
  {
    question: "How easy is it to customize?",
    answer:
      "The starter is designed to keep common changes straightforward. File ownership is obvious, naming is predictable, and simple work should not require unnecessary layers.",
  },
  {
    question: "Does it include real billing foundations?",
    answer:
      "Yes. Billing, plans, and feature gating are treated as real product foundations, not demo-only placeholders.",
  },
  {
    question: "Will I need to learn a custom architecture first?",
    answer:
      "No. The goal is to avoid framework-within-a-framework drift and keep the codebase fast to understand.",
  },
  {
    question: "Can I use it for client projects or multiple products?",
    answer:
      "Yes, depending on your license. Replace this answer with your exact license terms.",
  },
  {
    question: "Why not just use a free starter?",
    answer:
      "Because free starters often save less time, feel less credible, and create more modification friction later. This product is built to reduce that cost up front.",
  },
];

const BrandItalic = ({ children }: { children: React.ReactNode }) => (
  <em className="font-serif italic font-normal text-brand tracking-[-0.01em]">
    {children}
  </em>
);

export default function MarketingPage() {
  return (
    <main className="flex-1">
      <section className="relative">
        <div className="container mx-auto max-w-7xl px-6 pt-20 pb-32 md:px-10 md:pt-28 md:pb-40">
          <Hero
            pill={
              <AnnouncementPill
                label="v1.0"
                text="A boring SaaS starter that stays fast to edit"
                href="/auth/sign-up"
              />
            }
            title={
              <>
                Launch your Next.js SaaS{" "}
                <BrandItalic>faster</BrandItalic> — without rebuilding the same
                foundation <BrandItalic>again</BrandItalic>.
              </>
            }
            description={
              <>
                A premium SaaS starter for solo founders, consultants, indie
                hackers, and small technical teams who want to ship quickly,
                understand the code fast, and customize without friction.
              </>
            }
            actions={
              <HeroActions
                primaryLabel="Buy the Starter"
                primaryHref="/auth/sign-up"
                secondaryLabel="See pricing"
                secondaryHref="#pricing"
                note="14-day refund · Lifetime updates"
              />
            }
            stack={[
              "Next.js 16",
              "TypeScript",
              "Prisma",
              "Stripe",
              "Resend",
              "Vercel AI",
            ]}
            imageSrc="/marketing/screenshots/dashboard.png"
            imageAlt="A dashboard that feels like a real product, not a demo"
          />
        </div>
      </section>

      <Section containerClassName="py-14 md:py-16">
        <LogoCloud
          title="Everything you need to launch with confidence"
          logos={[
            "Production auth",
            "Subscription billing",
            "Team workspaces",
            "Dashboard & settings",
            "Clear conventions",
            "Real product surfaces",
          ]}
        />
      </Section>

      <Section id="positioning" index="01" eyebrow="Positioning">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <SectionHeading
            title={
              <>
                Most SaaS starters are either{" "}
                <BrandItalic>too bare</BrandItalic> or{" "}
                <BrandItalic>too heavy</BrandItalic>.
              </>
            }
          >
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Some starters save too little time. Others come with so much
                abstraction that modifying simple product flows becomes slower
                than it should be.
              </p>
              <p>
                This starter is built for a different outcome: helping technical
                builders launch faster with a codebase that feels obvious,
                credible, and safe to extend.
              </p>
              <p className="border-l-2 border-brand pl-4 text-foreground">
                No framework-within-a-framework. No unnecessary ceremony. Just a
                strong foundation you can actually build on.
              </p>
            </div>
          </SectionHeading>

          <FeatureGrid
            items={featureItems}
            className="md:grid-cols-2 xl:grid-cols-2"
            numbered
          />
        </div>
      </Section>

      <Section id="showcase" index="02" eyebrow="Product previews">
        <SectionHeading
          align="center"
          title={
            <>
              A starter that looks{" "}
              <BrandItalic>credible</BrandItalic> from day one.
            </>
          }
          description="Good foundations matter. But perceived quality matters too. This starter ships with product-ready surfaces that help your SaaS feel trustworthy immediately."
          className="mb-14"
        />
        <SplitShowcase
          defaultItemId="dashboard-overview"
          items={[
            {
              id: "dashboard-overview",
              title: "Dashboard that feels real",
              description:
                "Product-ready layout with stats, activity, and navigation.",
              media: {
                type: "image",
                src: "/marketing/screenshots/dashboard.png",
                alt: "Launch from a product that already feels real",
                width: 1600,
                height: 1000,
              },
            },
            {
              id: "production-auth",
              title: "Production-ready auth",
              description:
                "Email, password, OAuth, and magic links — not demo-level auth.",
              media: {
                type: "image",
                src: "/marketing/screenshots/login.png",
                alt: "Production-ready authentication, not demo-level auth",
                width: 1600,
                height: 1000,
              },
            },
            {
              id: "billing-foundations",
              title: "Real monetization",
              description:
                "Plans, subscriptions, and feature gating that work from day one.",
              media: {
                type: "image",
                src: "/marketing/screenshots/billing.png",
                alt: "Real monetization foundations from day one",
                width: 1600,
                height: 1000,
              },
            },
            {
              id: "team-structure",
              title: "Built for real SaaS usage",
              description:
                "Mbrands, roles, and invitations — not just solo demo flows.",
              media: {
                type: "image",
                src: "/marketing/screenshots/team.png",
                alt: "Built for real SaaS usage, not just solo demo flows",
                width: 1600,
                height: 1000,
              },
            },
            {
              id: "launch-ready",
              title: "Launch-ready settings",
              description:
                "Account, security, and workspace surfaces that feel complete.",
              media: {
                type: "image",
                src: "/marketing/screenshots/settings.png",
                alt: "Launch-ready settings that make the product feel complete",
                width: 1600,
                height: 1000,
              },
            },
            {
              id: "core-app",
              title: "A real app foundation",
              description:
                "Core product surfaces, not just infrastructure screens.",
              media: {
                type: "image",
                src: "/marketing/screenshots/tasks.png",
                alt: "A real app foundation, not just infrastructure screens",
                width: 1600,
                height: 1000,
              },
            },
            {
              id: "customization",
              title: "Built to be modified",
              description:
                "Documented setup and customization paths — not a codebase to decode.",
              media: {
                type: "image",
                src: "/marketing/screenshots/docs.png",
                alt: "Built to be modified quickly, not decoded slowly",
                width: 1600,
                height: 1000,
              },
            },
          ]}
        />
      </Section>

      <Section id="features" index="03" eyebrow="What's included">
        <SectionHeading
          align="center"
          title={
            <>
              Everything you need to stop rebuilding the{" "}
              <BrandItalic>same SaaS basics</BrandItalic>.
            </>
          }
          description="Auth, billing, dashboards, teams, and the product surfaces your buyers expect — all designed to be extended, not fought."
          className="mb-14"
        />

        <FeatureGrid
          items={includedBlocks}
          className="md:grid-cols-2 xl:grid-cols-2"
        />
      </Section>

      <Section id="proof" index="04" eyebrow="Proof" variant="muted">
        <SectionHeading
          align="center"
          title={
            <>
              Built to be <BrandItalic>modified</BrandItalic>, not admired.
            </>
          }
          description="The promise is not just cleaner code. It is faster product work when you need to add features, extend billing, or customize settings."
          className="mb-14"
        />

        <FeatureGrid items={proofBlocks} className="xl:grid-cols-3" />
      </Section>

      <Section id="comparison" index="05" eyebrow="Comparison">
        <SectionHeading
          align="center"
          title={
            <>
              Why this starter feels <BrandItalic>different</BrandItalic>.
            </>
          }
          description="A stronger base without the usual tradeoff of extra complexity."
          className="mb-14"
        />

        <FeatureGrid items={comparisonBlocks} className="xl:grid-cols-3" />
      </Section>

      <Section id="use-cases" index="06" eyebrow="Use cases" variant="muted">
        <SectionHeading
          align="center"
          title={
            <>
              More than a <BrandItalic>nicer boilerplate</BrandItalic>.
            </>
          }
          description="Meant to help technical buyers ship real products faster, not just browse prettier screenshots."
          className="mb-14"
        />

        <FeatureGrid
          items={extraContextBlocks}
          className="md:grid-cols-2 xl:grid-cols-2"
        />
      </Section>

      <Section id="pricing" index="07" eyebrow="Pricing">
        <SectionHeading
          align="center"
          title={
            <>
              Pick the package that matches the{" "}
              <BrandItalic>buyer you want</BrandItalic>.
            </>
          }
          description="Show pricing simply. The landing page should clarify value fast, not force people to decode a pricing engine."
          className="mb-14"
        />

        <PricingSection plans={pricingPlans} />
      </Section>

      <Section id="faq" index="08" eyebrow="FAQ">
        <SectionHeading
          align="center"
          title={
            <>
              Questions, <BrandItalic>answered</BrandItalic>.
            </>
          }
          className="mb-14"
        />

        <FaqSection items={faqItems} />
      </Section>

      <Section>
        <FinalCtaSection
          badge="Ready to launch"
          title={
            <>
              Stop rebuilding the{" "}
              <BrandItalic>same SaaS foundation</BrandItalic>.
            </>
          }
          description="Launch faster with a starter built to help you understand quickly, customize safely, and ship with confidence."
          primaryLabel="Get the starter"
          primaryHref="/auth/sign-up"
          secondaryLabel="Read docs"
          secondaryHref="/docs"
        />
      </Section>
    </main>
  );
}
