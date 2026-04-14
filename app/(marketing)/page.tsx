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
      "They can look complete, but cost more time to understand and customize.",
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
    description:
      "Built for real buyer needs, with a stronger launch-ready base.",
    className: "border-primary shadow-sm",
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
    period: "/ one-time",
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
    period: "/ one-time",
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
    period: "/ one-time",
    href: "/contact",
    ctaLabel: "Contact Sales",
    features: [
      "Everything in Pro",
      "Extended usage rights",
      "Priority support",
      "Launch help",
    ],
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

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <Section className="pt-10 md:pt-16">
          <Hero
            pill={
              <AnnouncementPill
                label="New"
                text="A boring SaaS starter that stays fast to understand and fast to edit"
                href="/auth/sign-up"
              />
            }
            title={
              <>
                Launch your Next.js SaaS faster without rebuilding the same
                foundation again.
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
                secondaryLabel="See Pricing"
                secondaryHref="#pricing"
              />
            }
            imageSrc="/marketing/screenshots/dashboard.png"
            imageAlt="Launch from a product that already feels real"
          />
        </Section>

        <Section className="pt-0">
          <LogoCloud
            title={<>Everything you need to launch with confidence</>}
            logos={[
              "Production-ready authentication",
              "Real subscription billing",
              "Team and workspace foundations",
              "Credible dashboard and settings",
              "Clear customization paths",
              "Built for fast product work",
            ]}
          />
        </Section>

        <Section
          id="features"
          containerClassName="mx-auto grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start"
        >
          <SectionHeading
            badge="Positioning"
            title={<>Most SaaS starters are either too bare or too heavy</>}
          >
            <div className="text-muted-foreground space-y-4 text-base sm:text-lg">
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
              <p>
                No framework-within-a-framework. No unnecessary ceremony. Just a
                strong foundation you can actually build on.
              </p>
            </div>
          </SectionHeading>

          <FeatureGrid
            items={featureItems}
            className="sm:grid-cols-2 xl:grid-cols-2"
          />
        </Section>

        <Section>
          <SectionHeading
            badge="Product previews"
            title={<>A starter that looks credible from day one</>}
            description={
              <>
                Good foundations matter. But perceived quality matters too. This
                starter ships with product-ready surfaces that help your SaaS
                feel trustworthy immediately.
              </>
            }
            align="center"
            className="mb-10"
          />
          <SplitShowcase
            defaultItemId="dashboard-overview"
            items={[
              {
                id: "dashboard-overview",
                title: <>Dashboard that already feels real</>,
                description: (
                  <>
                    Product-ready layout with stats, activity, and navigation.
                  </>
                ),
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
                title: <>Production-ready authentication</>,
                description: (
                  <>
                    Email, password, OAuth, and magic links — not demo-level
                    auth.
                  </>
                ),
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
                title: <>Real monetization foundations</>,
                description: (
                  <>
                    Plans, subscriptions, and feature gating that work from day
                    one.
                  </>
                ),
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
                title: <>Built for real SaaS usage</>,
                description: (
                  <>
                    Members, roles, and invitations — not just solo demo flows.
                  </>
                ),
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
                title: <>Launch-ready settings</>,
                description: (
                  <>
                    Account, security, and workspace surfaces that feel
                    complete.
                  </>
                ),
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
                title: <>A real app foundation</>,
                description: (
                  <>
                    Core product surfaces, not just infrastructure screens.
                  </>
                ),
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
                title: <>Built to be modified quickly</>,
                description: (
                  <>
                    Documented setup and customization paths — not a codebase
                    to decode.
                  </>
                ),
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

        <Section id="features">
          <SectionHeading
            badge="Positioning"
            align="center"
            title={<>What's included</>}
            description={
              <>
                Everything you need to stop rebuilding the same SaaS basics and
                start shipping faster.
              </>
            }
            className="mb-10"
          />

          <FeatureGrid
            items={includedBlocks}
            className="sm:grid-cols-2 xl:grid-cols-2 "
          />
        </Section>

        <Section className="bg-muted/40">
          <SectionHeading
            badge="Proof"
            align="center"
            title={<>Built to be modified, not admired</>}
            description={
              <>
                The promise is not just cleaner code. It is faster product work
                when you need to add features, extend billing, or customize
                settings.
              </>
            }
            className="mb-10"
          />

          <FeatureGrid items={proofBlocks} className="xl:grid-cols-3" />
        </Section>

        <Section>
          <SectionHeading
            badge="Comparison"
            align="center"
            title={<>Why this starter feels different</>}
            description={
              <>
                The goal is a stronger base without the usual tradeoff of extra
                complexity.
              </>
            }
            className="mb-10"
          />

          <FeatureGrid items={comparisonBlocks} className="xl:grid-cols-3" />
        </Section>

        <Section className="bg-muted/40">
          <SectionHeading
            badge="Use cases"
            align="center"
            title={<>More than a nicer boilerplate</>}
            description={
              <>
                This starter is meant to help technical buyers ship real
                products faster, not just browse prettier screenshots.
              </>
            }
            className="mb-10"
          />

          <FeatureGrid
            items={extraContextBlocks}
            className="sm:grid-cols-2 xl:grid-cols-2"
          />
        </Section>

        <Section id="pricing">
          <SectionHeading
            badge="Pricing"
            title={<>Pick the package that matches the buyer you want</>}
            description={
              <>
                Show pricing simply. The landing page should clarify value fast,
                not force people to decode a pricing engine.
              </>
            }
            align="center"
            className="mb-10"
          />

          <PricingSection plans={pricingPlans} />
        </Section>

        <Section id="faq">
          <SectionHeading
            badge="FAQ"
            title={<>Frequently asked questions</>}
            align="center"
            className="mb-10"
          />

          <FaqSection items={faqItems} />
        </Section>

        <Section>
          <FinalCtaSection
            badge="Ready to launch"
            title={<>Stop rebuilding the same SaaS foundation</>}
            description={
              <>
                Launch faster with a starter built to help you understand
                quickly, customize safely, and ship with confidence.
              </>
            }
            primaryLabel="Start now"
            primaryHref="/auth/sign-up"
            secondaryLabel="Read docs"
            secondaryHref="/docs"
          />
        </Section>
      </main>
    </div>
  );
}
