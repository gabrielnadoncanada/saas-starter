import { Code2, LayoutDashboard, Rocket, Shield } from "lucide-react";

import {
  AnnouncementPill,
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
import { cn } from "@/lib/utils";

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

const featureColumns = [
  {
    label: "Core",
    title: "Core foundations",
    items: [
      "Authentication flows",
      "Protected application area",
      "Account management",
      "Product-ready settings foundation",
      "Database-backed structure",
    ],
  },
  {
    label: "Money",
    title: "Monetization",
    items: [
      "Subscription billing",
      "Plan structure",
      "Feature gating foundation",
      "Usage limit extensibility",
      "Billing-ready product model",
    ],
  },
  {
    label: "Structure",
    title: "SaaS structure",
    items: [
      "Dashboard shell",
      "Team and workspace support",
      "Navigation foundations",
      "Extendable product architecture",
      "Real app starting point",
    ],
  },
  {
    label: "DX",
    title: "Developer experience",
    items: [
      "Predictable file ownership",
      "Obvious naming patterns",
      "Straightforward feature extension",
      "Low-ceremony code organization",
      "Documentation for setup and customization",
    ],
  },
];

const workflows = [
  {
    label: "Build",
    title: "Add a feature",
    description:
      "Create the schema, add the page, connect the action, and ship — no mini-framework to wire.",
    steps: ["Create schema", "Add page", "Connect action", "Ship"],
  },
  {
    label: "Bill",
    title: "Extend billing",
    description:
      "Adjust plans, update feature gating, and evolve monetization without hunting through layers.",
    steps: ["Adjust plan", "Update gating", "Review limits", "Go live"],
  },
  {
    label: "Tune",
    title: "Customize settings",
    description:
      "Edit account and workspace flows where you expect them, with direct ownership and fewer jumps.",
    steps: ["Edit section", "Save flow", "Validate UI", "Done"],
  },
];

const comparisonColumns = [
  {
    label: "Other boilerplates",
    description:
      "Often save too little time and still need lots of rebuilding.",
    items: [
      "Save too little time",
      "Look unfinished",
      "Need lots of rebuilding",
      "Weak monetization foundations",
      "Poor launch credibility",
    ],
    tone: "weak" as const,
  },
  {
    label: "Heavy starters",
    description:
      "Look complete, but cost more time to understand and customize.",
    items: [
      "Harder to understand",
      "Too much ceremony",
      "Too many internal patterns",
      "Slower to customize",
      "Higher cognitive load",
    ],
    tone: "weak" as const,
  },
  {
    label: "This starter",
    description:
      "Built for real buyer needs, with a stronger launch-ready base.",
    items: [
      "Strong launch-ready base",
      "Clear product foundations",
      "Faster time to understand",
      "Faster time to modify",
      "Built for real buyer needs",
    ],
    tone: "brand" as const,
  },
];

const useCases = [
  "B2B SaaS products",
  "Client portals",
  "AI-powered SaaS tools",
  "Internal business software",
  "Niche vertical products",
  "Paid MVPs with real monetization foundations",
];

const principles = [
  "Obviousness over purity",
  "Boundaries without ceremony",
  "Complexity only where it is earned",
  "Visible value over invisible sophistication",
];

const soloPurchaseHref =
  process.env.NEXT_PUBLIC_STARTER_PURCHASE_URL_SOLO || "#pricing";
const teamPurchaseHref =
  process.env.NEXT_PUBLIC_STARTER_PURCHASE_URL_TEAM || "#pricing";

const pricingPlans = [
  {
    name: "Solo",
    description: "For one developer shipping unlimited projects.",
    price: "$249",
    period: "one-time",
    href: soloPurchaseHref,
    ctaLabel: "Buy Solo",
    features: [
      "1 developer seat",
      "Unlimited end products",
      "Commercial usage",
      "Lifetime updates",
      "Private GitHub access",
    ],
    badge: "Individual",
  },
  {
    name: "Team",
    description:
      "For small teams and consultants building client-facing products.",
    price: "$599",
    period: "one-time",
    href: teamPurchaseHref,
    ctaLabel: "Buy Team",
    features: [
      "Up to 5 developer seats",
      "Unlimited end products",
      "Commercial usage",
      "Lifetime updates",
      "Priority email support",
    ],
    badge: "Best value",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For agencies delivering client projects at scale.",
    price: "$1,299",
    period: "one-time",
    href: "/contact",
    ctaLabel: "Contact Sales",
    features: [
      "Up to 10 developer seats",
      "White-label rights",
      "Unlimited end products",
      "Lifetime updates",
      "Priority support",
    ],
    badge: "Teams",
  },
];

const faqItems = [
  {
    question: "Who is this for?",
    answer:
      "Solo founders, consultants, freelancers, indie hackers, and small technical teams who want a fast path to a launchable SaaS without rebuilding auth, billing, and plan gating from scratch.",
  },
  {
    question: "What do I get when I buy?",
    answer:
      "Immediate access to a private GitHub repository with the full source code, plus all future updates for the lifetime of the product. You own your copy of the code and can ship it to production the same day.",
  },
  {
    question: "Can I use it for client projects or multiple products?",
    answer:
      "Yes. Every tier includes unlimited end products and full commercial usage. Build for yourself, for your startup, or for clients — no per-project fees, ever.",
  },
  {
    question: "What's the difference between Solo, Team, and Agency?",
    answer:
      "Tiers are based on seats. Solo is for one developer. Team covers up to 5 developers in one company. Agency covers up to 10 developers and adds white-label rights for client delivery at scale. All tiers include unlimited projects.",
  },
  {
    question: "Do I get future updates?",
    answer:
      "Yes. Every tier includes lifetime updates. When we ship new features, upgrades, or framework bumps, you get them in your private repo at no extra cost.",
  },
  {
    question: "What's NOT allowed under the license?",
    answer:
      "You cannot resell or redistribute the starter codebase itself, sublicense it, or use it to build a competing starter kit or template product. Seats are per developer and cannot be shared. Full terms at /license.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Because the product is delivered as source code and GitHub access is granted immediately after purchase, all sales are final. If you have questions before buying, reach out first and we'll help you decide.",
  },
  {
    question: "Is this just a boilerplate?",
    answer:
      "No. It is a product-ready SaaS foundation with real auth, Stripe billing with enforced plan gating, teams, admin panel, and an AI assistant — the things most starters leave as an exercise for the reader.",
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
                Launch your Next.js SaaS <BrandItalic>faster</BrandItalic> —
                without rebuilding the same foundation{" "}
                <BrandItalic>again</BrandItalic>.
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
                primaryLabel="See pricing"
                primaryHref="#pricing"
                secondaryLabel="View docs"
                secondaryHref="/docs/getting-started"
                note="Lifetime updates"
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

      <Section id="positioning">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <SectionHeading
            index="01"
            eyebrow="Positioning"
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

      <Section id="showcase">
        <SectionHeading
          index="02"
          eyebrow="Product previews"
          align="center"
          title={
            <>
              A starter that looks <BrandItalic>credible</BrandItalic> from day
              one.
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
          ]}
        />
        <div className="mt-px">
          <SplitShowcase
            reverse
            defaultItemId="team-structure"
            items={[
              {
                id: "team-structure",
                title: "Built for real SaaS usage",
                description:
                  "Members, roles, and invitations — not just solo demo flows.",
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
            ]}
          />
        </div>
      </Section>

      <Section id="features">
        <SectionHeading
          index="03"
          eyebrow="What's included"
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

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
          {featureColumns.map((col, i) => (
            <div key={col.label} className="bg-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="font-mono text-[11px] tabular-nums text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border" />
                <span className="label-mono">{col.label}</span>
              </div>
              <h3 className="mb-6 text-lg font-semibold tracking-[-0.015em]">
                {col.title}
              </h3>
              <ul className="divide-y divide-border border-t border-border">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="py-3 text-sm leading-relaxed text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="proof">
        <SectionHeading
          index="04"
          eyebrow="Proof"
          align="center"
          title={
            <>
              Built to be <BrandItalic>modified</BrandItalic>, not admired.
            </>
          }
          description="The promise is not just cleaner code. It is faster product work when you need to add features, extend billing, or customize settings."
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
          {workflows.map((wf) => (
            <div key={wf.label} className="flex flex-col bg-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <span aria-hidden className="size-1.5 bg-brand" />
                <span className="label-mono">{wf.label}</span>
              </div>

              <h3 className="mb-3 text-lg font-semibold tracking-[-0.015em]">
                {wf.title}
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                {wf.description}
              </p>

              <ol className="mt-auto divide-y divide-border border-t border-border">
                {wf.steps.map((step, j) => {
                  const isLast = j === wf.steps.length - 1;
                  return (
                    <li key={step} className="flex items-center gap-4 py-3">
                      <span className="w-6 font-mono text-[10px] tabular-nums text-muted-foreground">
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                      {isLast ? (
                        <span
                          aria-hidden
                          className="ml-auto size-1.5 bg-brand"
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      <Section id="comparison">
        <SectionHeading
          align="center"
          index="05"
          eyebrow="Comparison"
          title={
            <>
              Why this starter feels <BrandItalic>different</BrandItalic>.
            </>
          }
          description="A stronger base without the usual tradeoff of extra complexity."
          className="mb-14"
        />
        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-3">
          {comparisonColumns.map((col) => {
            const isBrand = col.tone === "brand";
            return (
              <div
                key={col.label}
                className="relative flex flex-col bg-card p-8"
              >
                {isBrand ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-brand"
                  />
                ) : null}

                <div className="mb-6 flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5",
                      isBrand ? "bg-brand" : "bg-muted-foreground/40",
                    )}
                  />
                  <span className={cn("label-mono", isBrand && "text-brand")}>
                    {col.label}
                  </span>
                </div>

                <p
                  className={cn(
                    "mb-8 text-sm leading-relaxed",
                    isBrand ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {col.description}
                </p>

                <ul className="mt-auto divide-y divide-border border-t border-border">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "flex items-baseline gap-3 py-3 text-sm",
                        isBrand ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[6px] size-1 shrink-0",
                          isBrand ? "bg-brand" : "bg-muted-foreground/30",
                        )}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="use-cases">
        <SectionHeading
          align="center"
          index="06"
          eyebrow="Use cases"
          title={
            <>
              More than a <BrandItalic>nicer boilerplate</BrandItalic>.
            </>
          }
          description="Meant to help technical buyers ship real products faster, not just browse prettier screenshots."
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-[1.4fr_1fr]">
          <div className="bg-card p-8 md:p-10">
            <div className="mb-8 flex items-center gap-3">
              <span aria-hidden className="size-1.5 bg-brand" />
              <span className="label-mono">Use it to build</span>
            </div>

            <p className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground">
              Start from a foundation that already solves the expensive,
              repetitive parts.
            </p>

            <ul className="divide-y divide-border border-t border-border">
              {useCases.map((item, i) => (
                <li key={item} className="flex items-baseline gap-6 py-4">
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col bg-card p-8 md:p-10">
            <div className="mb-8 flex items-center gap-3">
              <span aria-hidden className="size-1.5 bg-brand" />
              <span className="label-mono">Editorial note</span>
            </div>

            <blockquote className="font-serif text-2xl leading-[1.15] tracking-[-0.01em] md:text-[28px]">
              <span aria-hidden className="text-brand">
                &ldquo;
              </span>
              A better starter is not the one with the most layers — it is the
              one that helps you launch with less hesitation and faster
              progress.
              <span aria-hidden className="text-brand">
                &rdquo;
              </span>
            </blockquote>

            <ul className="mt-auto space-y-3 border-t border-border pt-8">
              {principles.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span aria-hidden className="size-1 bg-brand" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="pricing">
        <SectionHeading
          align="center"
          index="07"
          eyebrow="Pricing"
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

      <Section id="faq">
        <SectionHeading
          index="08"
          eyebrow="FAQ"
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
          primaryHref="#pricing"
          secondaryLabel="Read docs"
          secondaryHref="/docs"
        />
      </Section>
    </main>
  );
}
