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
  ScreenshotGallery,
  Section,
  SectionHeading,
} from "@/features/marketing/components";
import type {
  GalleryCategory,
  GalleryShot,
} from "@/features/marketing/components/screenshot-gallery";
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
    label: "Auth",
    title: "Production auth",
    items: [
      "Email + password + OAuth",
      "Magic links",
      "Two-factor authentication",
      "Password reset & email verification",
      "Session & device management",
    ],
  },
  {
    label: "Billing",
    title: "Stripe billing",
    items: [
      "Subscription checkout & portal",
      "Plan gating on features",
      "Usage metering with limits",
      "Webhook-synced state",
      "Multi-plan pricing surface",
    ],
  },
  {
    label: "Teams",
    title: "Multi-tenant orgs",
    items: [
      "Organization creation & switching",
      "Member invites & role checks",
      "Per-tenant scoping on all queries",
      "Seat-aware permissions",
      "Activity audit log",
    ],
  },
  {
    label: "Admin",
    title: "Admin panel",
    items: [
      "User & organization tables",
      "Ban / unban / impersonation",
      "Signups chart & plan breakdown",
      "Recent activity stream",
      "Role-gated routes",
    ],
  },
  {
    label: "AI",
    title: "AI assistant",
    items: [
      "Google, OpenAI & Groq providers",
      "Streaming chat with tool calls",
      "Chart & document artifacts",
      "Conversation persistence",
      "Usage-limit aware",
    ],
  },
  {
    label: "DX",
    title: "Developer experience",
    items: [
      "Feature-based structure",
      "Server actions + Zod schemas",
      "Prisma multi-file schema",
      "Resend email templates",
      "Built-in docs page",
    ],
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

const SHOT_BASE = "/marketing/screenshots";

function shot(
  id: string,
  caption: string,
  alt: string,
  filename: string,
): GalleryShot {
  return {
    id,
    caption,
    alt,
    src: `${SHOT_BASE}/dark/${filename}.png`,
    srcLight: `${SHOT_BASE}/light/${filename}.png`,
  };
}

const galleryCategories: GalleryCategory[] = [
  {
    id: "organization",
    label: "Organization",
    note: "Multi-tenant workspace with the AI surfaces you will actually ship.",
    shots: [
      shot("org-dashboard", "Organization / Dashboard", "Organization dashboard with KPIs", "dashboard"),
      shot("org-tasks", "Organization / Tasks", "Tasks table with labels, priorities and statuses", "tasks"),
      shot("org-assistant-home", "Assistant / Home", "AI assistant empty state with suggested prompts", "assistant-home"),
      shot("org-assistant-chat", "Assistant / Conversation", "AI assistant mid-conversation with tool calls", "assistant"),
      shot("org-assistant-chart", "Assistant / Chart artifact", "AI assistant rendering a bar chart artifact", "assistant-chart"),
      shot("org-members", "Organization / Members", "Team members and invitations", "settings-members"),
      shot("org-settings", "Organization / Settings", "Rename or delete the current organization", "settings-organization"),
      shot("org-activity", "Organization / Activity", "Per-tenant audit log of user actions", "settings-activity"),
    ],
  },
  {
    id: "account",
    label: "Personal account",
    shots: [
      shot("account-profile", "Account / Profile", "Profile settings", "settings"),
      shot("account-billing", "Account / Billing", "Subscription and plan controls", "settings-billing"),
      shot("account-security", "Account / Security", "Sessions, password, and two-factor authentication", "settings-security"),
      shot("account-preferences", "Account / Preferences", "Notification and UI preferences", "settings-preferences"),
    ],
  },
  {
    id: "admin",
    label: "Admin panel",
    note: "Role-gated operations dashboard for the platform owner.",
    shots: [
      shot("admin-dashboard", "Admin / Dashboard", "Admin overview with KPIs, signups chart and plan breakdown", "admin"),
      shot("admin-users", "Admin / Users", "Admin users directory with ban and impersonate", "admin-users"),
      shot("admin-user-detail", "Admin / User detail", "User detail drawer with sessions and role controls", "admin-user-detail"),
      shot("admin-organizations", "Admin / Organizations", "Organizations directory with plan and seat info", "admin-organizations"),
      shot("admin-organization-detail", "Admin / Organization detail", "Organization detail drawer with members and subscription", "admin-organization-detail"),
    ],
  },
  {
    id: "auth",
    label: "Auth",
    shots: [
      shot("auth-sign-in", "Auth / Sign in", "Sign-in page with email, password and OAuth", "sign-in"),
      shot("auth-sign-up", "Auth / Sign up", "Sign-up page", "sign-up"),
      shot("auth-forgot", "Auth / Forgot password", "Forgot password request screen", "forgot-password"),
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    shots: [
      shot("marketing-home", "Marketing / Home", "Marketing homepage", "marketing-home"),
      shot("marketing-pricing", "Marketing / Pricing", "Pricing page with plan comparison", "pricing"),
      shot("marketing-blog", "Marketing / Blog", "Blog index", "blog"),
      shot("marketing-contact", "Marketing / Contact", "Contact form", "contact"),
    ],
  },
  {
    id: "emails",
    label: "Emails",
    shots: [
      shot("email-magic-link", "Email / Magic link", "Magic link sign-in email", "email-magic-link"),
      shot("email-team-invitation", "Email / Team invite", "Team invitation email", "email-team-invitation"),
      shot("email-reset-password", "Email / Reset password", "Reset password email", "email-reset-password"),
      shot("email-verify-email", "Email / Verify email", "Email verification template", "email-verify-email"),
      shot("email-password-changed", "Email / Password changed", "Password changed notification", "email-password-changed"),
      shot("email-contact-message", "Email / Contact message", "Contact form message email", "email-contact-message"),
    ],
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

const soloPurchaseHref =
  process.env.NEXT_PUBLIC_STARTER_PURCHASE_URL_SOLO || "#pricing";
const teamPurchaseHref =
  process.env.NEXT_PUBLIC_STARTER_PURCHASE_URL_TEAM || "#pricing";
const agencyPurchaseHref =
  process.env.NEXT_PUBLIC_STARTER_PURCHASE_URL_AGENCY || "#pricing";

const commonPlanFeatures = [
  "Unlimited end products",
  "Commercial usage",
  "Lifetime updates",
  "Private GitHub access",
  "Live demo access before you buy",
];

const pricingPlans = [
  {
    name: "Solo",
    description: "For one developer shipping unlimited projects.",
    price: "$249",
    period: "one-time",
    href: soloPurchaseHref,
    ctaLabel: "Get Solo — $249",
    features: ["1 developer seat", ...commonPlanFeatures],
    badge: "Individual",
  },
  {
    name: "Team",
    description:
      "For small teams and consultants building client-facing products.",
    price: "$599",
    period: "one-time",
    href: teamPurchaseHref,
    ctaLabel: "Get Team — $599",
    features: [
      "Up to 5 developer seats",
      ...commonPlanFeatures,
      "Priority email support",
    ],
    badge: "Save $646 vs 5× Solo",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For agencies delivering client projects at scale.",
    price: "$1,299",
    period: "one-time",
    href: agencyPurchaseHref,
    ctaLabel: "Get Agency — $1,299",
    features: [
      "Up to 10 developer seats",
      ...commonPlanFeatures,
      "Priority support",
    ],
    badge: "Save $1,191 vs 10× Solo",
  },
];

const timeSavedBreakdown = [
  { label: "Authentication flows (email, OAuth, magic links)", hours: 40 },
  { label: "Stripe billing, plan gating & webhooks", hours: 50 },
  { label: "Multi-tenant organizations, roles & invites", hours: 35 },
  { label: "Admin panel & user management", hours: 25 },
  { label: "Dashboard, settings & account surfaces", hours: 30 },
  { label: "AI assistant integration", hours: 20 },
];
const totalHoursSaved = timeSavedBreakdown.reduce(
  (acc, item) => acc + item.hours,
  0,
);
const contractorRate = 75;
const totalDevCost = totalHoursSaved * contractorRate;

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
      "No refunds — but the live demo is your guarantee. You get full access to the running product before you pay: click through the dashboard, auth, billing, teams, admin panel, and AI assistant. If the demo doesn't convince you, don't buy. Once you purchase, we hand over the source code and private GitHub access immediately — that's why the sale is final. Try the demo first, and only buy when you're sure.",
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
              />
            }
            title={
              <>
                Auth, billing, teams, admin —{" "}
                <BrandItalic>already shipped</BrandItalic>. Build the product
                that&apos;s <BrandItalic>actually yours</BrandItalic>.
              </>
            }
            description={
              <>
                Stripe billing, multi-tenant organizations, production auth, an
                admin panel, and an AI assistant — wired together in a codebase
                built to be read, not decoded.
              </>
            }
            actions={
              <HeroActions
                primaryLabel="Get the starter — $249"
                primaryHref="#pricing"
                secondaryLabel="Try the live demo"
                secondaryHref={process.env.NEXT_PUBLIC_DEMO_URL ?? "/sign-in"}
                note="One-time · Lifetime updates"
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
            "Team organizations",
            "Dashboard & settings",
            "Clear conventions",
            "Real product surfaces",
          ]}
        />
      </Section>

      <Section id="gallery" containerClassName="py-20 md:py-24">
        <SectionHeading
          index="01"
          eyebrow="Full tour"
          align="center"
          title={
            <>
              Every surface you get, on <BrandItalic>day one</BrandItalic>.
            </>
          }
          description="Browse the full product by category. Not three cherry-picked screens — the actual shell your users will see before you write a single line of custom code."
          className="mb-14"
        />

        <ScreenshotGallery
          categories={galleryCategories}
          defaultCategoryId="organization"
          stickyTop="top-16"
        />
      </Section>

      <Section id="positioning">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <SectionHeading
            index="02"
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

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
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

      <Section id="comparison">
        <SectionHeading
          align="center"
          index="04"
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
          index="05"
          eyebrow="Use cases"
          title={
            <>
              More than a <BrandItalic>nicer boilerplate</BrandItalic>.
            </>
          }
          description="Meant to help technical buyers ship real products faster, not just browse prettier screenshots."
          className="mb-14"
        />

        <div className="border border-border bg-card p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <span aria-hidden className="size-1.5 bg-brand" />
            <span className="label-mono">Use it to build</span>
          </div>

          <p className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground">
            Start from a foundation that already solves the expensive,
            repetitive parts.
          </p>

          <ul className="grid grid-cols-1 gap-px border-t border-border bg-border md:grid-cols-2">
            {useCases.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline gap-6 bg-card px-6 py-5"
              >
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-base text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="value">
        <SectionHeading
          align="center"
          index="06"
          eyebrow="What you're actually buying"
          title={
            <>
              Roughly <BrandItalic>{totalHoursSaved} hours</BrandItalic> of
              engineering, already done.
            </>
          }
          description="The parts every SaaS rebuilds from scratch — shipped, wired together, and ready to extend."
          className="mb-14"
        />

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px border border-border bg-border lg:grid-cols-[1.4fr_1fr]">
          <div className="bg-card p-8 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <span aria-hidden className="size-1.5 bg-brand" />
              <span className="label-mono">Hours saved</span>
            </div>

            <ul className="divide-y divide-border border-t border-border">
              {timeSavedBreakdown.map((item, i) => (
                <li key={item.label} className="flex items-baseline gap-6 py-4">
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm leading-relaxed text-foreground">
                    {item.label}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    ~{item.hours}h
                  </span>
                </li>
              ))}
              <li className="flex items-baseline gap-6 py-5">
                <span aria-hidden className="w-[22px]" />
                <span className="flex-1 text-sm font-semibold tracking-[-0.01em] text-foreground">
                  Total engineering shipped
                </span>
                <span className="font-mono text-base font-semibold tabular-nums text-brand">
                  ~{totalHoursSaved}h
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col bg-card p-8 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <span aria-hidden className="size-1.5 bg-brand" />
              <span className="label-mono">Do the math</span>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              At a ${contractorRate}/hour contractor rate, rebuilding this
              yourself runs around:
            </p>

            <div className="mb-8 border-y border-border py-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Replacement cost
              </div>
              <div className="mt-2 text-4xl font-semibold tracking-[-0.03em] tabular-nums md:text-5xl">
                ${totalDevCost.toLocaleString("en-US")}
              </div>
            </div>

            <div className="mb-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand">
                You pay
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-[-0.03em] tabular-nums text-brand md:text-5xl">
                  $249
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  one-time
                </span>
              </div>
            </div>

            <p className="mt-auto pt-8 text-sm leading-relaxed text-muted-foreground">
              Every hour you don&apos;t rebuild auth, billing, and org plumbing
              is an hour on the thing that actually makes your product
              different.
            </p>
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
              One-time payment. <BrandItalic>No subscription.</BrandItalic>{" "}
              Lifetime updates.
            </>
          }
          description="Pick your seat count. Every tier ships the same code, unlimited projects, and full commercial usage."
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
