import type { Metadata } from "next";
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
import { getStarterPricingStatus } from "@/config/pricing.config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Next.js SaaS Starter for Real B2B Foundations",
  description:
    "A production-ready Next.js SaaS starter for technical founders who need auth, Stripe billing, organizations, admin, and AI without buying a heavy starter kit.",
};

const featureItems = [
  {
    title: "Ship faster",
    description:
      "Skip weeks of setup and start from a SaaS foundation that already feels sellable.",
    icon: Rocket,
  },
  {
    title: "Understand faster",
    description:
      "Open the repo and quickly see where things live, how the flow works, and what to change next.",
    icon: Code2,
  },
  {
    title: "Modify safely",
    description:
      "Add features and change core flows without first decoding someone else's framework.",
    icon: Shield,
  },
  {
    title: "Sell with credibility",
    description:
      "Start from product surfaces that already look like a real B2B SaaS, not a weekend demo.",
    icon: LayoutDashboard,
  },
];

const featureColumns = [
  {
    label: "Auth",
    title: "Auth that already feels done",
    items: [
      "Email + password, OAuth, and magic links",
      "Two-factor authentication",
      "Password reset and email verification",
      "Session and device management",
      "Account linking and soft delete",
    ],
  },
  {
    label: "Billing",
    title: "Billing that controls the product",
    items: [
      "Stripe checkout and customer portal",
      "Capabilities and usage limits",
      "Webhook-synced billing state",
      "Config-driven plan gating",
      "Ready for monthly and yearly plans",
    ],
  },
  {
    label: "Teams",
    title: "Real team workspaces",
    items: [
      "Organizations, invites, and switching",
      "Owner, Admin, and Member roles",
      "Tenant-scoped queries and mutations",
      "Seat-aware permissions",
      "Per-organization activity history",
    ],
  },
  {
    label: "Admin",
    title: "Admin surfaces buyers expect",
    items: [
      "User and organization directories",
      "Ban, unban, and impersonation",
      "Plan and signup visibility",
      "Recent activity stream",
      "Role-gated admin routes",
    ],
  },
  {
    label: "AI",
    title: "AI included in the product",
    items: [
      "Org-scoped assistant experience",
      "Streaming chat with tool calls",
      "Chart and document artifacts",
      "Saved conversations",
      "Usage-aware access",
    ],
  },
  {
    label: "DX",
    title: "A codebase you can still read later",
    items: [
      "Feature-first structure",
      "Thin routes, server actions, and Zod",
      "Prisma schema and seed data included",
      "Email templates and local docs",
      "Built to customize without unlearning it first",
    ],
  },
];

const comparisonColumns = [
  {
    label: "Thin starters",
    description:
      "Fast to buy, but still leave the expensive B2B parts for you to rebuild.",
    items: [
      "Good for basic MVPs",
      "Weak team and admin foundations",
      "More product plumbing left to build",
      "Less credible out of the box",
      "Often become a rewrite later",
    ],
    tone: "weak" as const,
  },
  {
    label: "Heavy starters",
    description:
      "Complete on paper, but harder to understand when you need to move fast.",
    items: [
      "More architecture to absorb",
      "More ceremony around simple changes",
      "More patterns to learn first",
      "Slower first customization pass",
      "Higher cognitive load for small teams",
    ],
    tone: "weak" as const,
  },
  {
    label: "Tenviq",
    description:
      "A launch-ready B2B base with less code archaeology before you can ship.",
    items: [
      "Teams, billing, admin, and AI already wired",
      "Readable feature-first codebase",
      "Faster time to first real feature",
      "Safer changes without hidden architecture",
      "Built for technical founders, not framework tourists",
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
  "B2B SaaS with team workspaces and invitations",
  "AI SaaS products with gated plans and usage limits",
  "Vertical SaaS that needs admin and account surfaces on day one",
  "Paid MVPs that need to look credible in demos and sales calls",
  "Products that must grow from first user to first team account without a rewrite",
];

const pricingStatus = getStarterPricingStatus();

const commonPlanFeatures = [
  "Auth, billing, teams, admin, AI, and docs included",
  "1 developer seat",
  "Unlimited end products",
  "Commercial usage",
  "Lifetime updates",
  "Private GitHub access",
  "Live demo access before you buy",
];

const foundingSeatsRemainingLabel = `${pricingStatus.founding.remaining} of ${pricingStatus.founding.total} founding seats left`;

const pricingPlans = [
  {
    name: "Founding",
    description:
      "For the first 20 builders who want the sharpest price and a direct line on what ships next.",
    price: `$${pricingStatus.tiers.founding.price}`,
    period: "one-time",
    priceNote: pricingStatus.founding.active
      ? foundingSeatsRemainingLabel
      : "Sold out",
    href: pricingStatus.tiers.founding.href,
    ctaLabel: pricingStatus.founding.active
      ? `Claim a founding seat — $${pricingStatus.tiers.founding.price}`
      : "Founding seats sold out",
    features: [
      "Direct input on what ships next",
      ...commonPlanFeatures,
    ],
    badge: pricingStatus.founding.active ? "Only 20 seats" : "Sold out",
    highlighted: pricingStatus.founding.active,
    disabled: !pricingStatus.founding.active,
  },
  {
    name: "Early access",
    description:
      "For the next 80 builders. Locked-in price before the permanent tier kicks in.",
    price: `$${pricingStatus.tiers.early.price}`,
    period: "one-time",
    priceNote: pricingStatus.founding.active
      ? "Unlocks once founding is sold"
      : pricingStatus.early.active
        ? `${pricingStatus.early.remaining} early seats left`
        : "Sold out",
    href: pricingStatus.tiers.early.href,
    ctaLabel: pricingStatus.early.active
      ? `Get early access — $${pricingStatus.tiers.early.price}`
      : pricingStatus.founding.active
        ? "Unlocks after founding"
        : "Early access sold out",
    features: commonPlanFeatures,
    badge: pricingStatus.early.active ? "Limited to 100 total" : "Next tier",
    highlighted: pricingStatus.early.active,
    disabled: !pricingStatus.early.active,
  },
  {
    name: "Standard",
    description:
      "The permanent price once early-access seats are filled.",
    price: `$${pricingStatus.tiers.standard.price}`,
    period: "one-time",
    priceNote: pricingStatus.activeTier.id === "standard"
      ? "Available now"
      : "Permanent price",
    href: pricingStatus.tiers.standard.href,
    ctaLabel: pricingStatus.activeTier.id === "standard"
      ? `Buy Tenviq — $${pricingStatus.tiers.standard.price}`
      : "Available after early access",
    features: commonPlanFeatures,
    badge: "Permanent",
    highlighted: pricingStatus.activeTier.id === "standard",
    disabled: pricingStatus.activeTier.id !== "standard",
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
    question: "Why is the price so low right now?",
    answer:
      "Tenviq is production-ready today. The founding price exists because we are trading price for two things: direct feedback from the first 20 builders using it in anger, and permission to quote them when we move to the standard price. You get the same codebase, the same private GitHub access, and the same lifetime updates as someone paying $249 later. Once the 20 founding seats are gone, the price moves to $149, then $249 permanently.",
  },
  {
    question: "Who is this for?",
    answer:
      "Technical founders building a real B2B or AI SaaS who want auth, billing, organizations, admin, and product-ready surfaces without buying a heavy starter they will spend weeks decoding.",
  },
  {
    question: "What do I get when I buy?",
    answer:
      "Immediate access to a private GitHub repository with the full source code, the same product surfaces you can inspect in the live demo, and all future updates for the lifetime of the product. You own your copy and can start shipping from it the same day.",
  },
  {
    question: "Can I use it for client projects or multiple products?",
    answer:
      "Yes. The starter includes unlimited end products and full commercial usage. Build for yourself, for your startup, or for client work without per-project fees.",
  },
  {
    question: "Who is this not for?",
    answer:
      "If you only need a basic login, a landing page, and a Stripe button for a simple solo MVP, this is probably more foundation than you need. It is best for products that actually need teams, billing rules, admin visibility, and room to grow.",
  },
  {
    question: "Do I get future updates?",
    answer:
      "Yes. The starter includes lifetime updates. When we ship new features, upgrades, or framework bumps, you get them in your private repo at no extra cost.",
  },
  {
    question: "What's NOT allowed under the license?",
    answer:
      "You cannot resell or redistribute the starter codebase itself, sublicense it, or use it to build a competing starter kit or template product. The seat is per developer and cannot be shared. Full terms at /license.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "No refunds — but the live demo is your guarantee. You get full access to the running product before you pay: click through the dashboard, auth, billing, teams, admin panel, and AI assistant. If the demo doesn't convince you, don't buy. Once you purchase, we hand over the source code and private GitHub access immediately — that's why the sale is final. Try the demo first, and only buy when you're sure.",
  },
  {
    question: "Is this just a boilerplate?",
    answer:
      "No. It is a product-ready B2B SaaS foundation with real auth, enforced billing logic, teams, admin surfaces, and an AI assistant already wired together. The point is not just faster setup. The point is starting from a product that already feels real.",
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
                label={
                  pricingStatus.founding.active
                    ? `${pricingStatus.founding.remaining} / ${pricingStatus.founding.total} left`
                    : "v1.0"
                }
                text={
                  pricingStatus.founding.active
                    ? `Founding seats at $${pricingStatus.tiers.founding.price} — grab one before the price moves to $${pricingStatus.tiers.early.price}`
                    : "For technical founders building real B2B SaaS"
                }
                href="#pricing"
              />
            }
            title={
              <>
                The Next.js SaaS starter for builders who want{" "}
                <BrandItalic>real B2B foundations</BrandItalic>, without the
                heavy starter kit.
              </>
            }
            description={
              <>
                Auth, Stripe billing, organizations, admin, and AI are already
                wired together in a codebase you can understand in an afternoon
                and extend without fighting hidden architecture.
              </>
            }
            actions={
              <HeroActions
                primaryLabel={
                  pricingStatus.founding.active
                    ? `Claim a founding seat — $${pricingStatus.tiers.founding.price}`
                    : pricingStatus.early.active
                      ? `Get early access — $${pricingStatus.tiers.early.price}`
                      : `Buy Tenviq — $${pricingStatus.tiers.standard.price}`
                }
                primaryHref="#pricing"
                secondaryLabel="Try the live demo"
                secondaryHref={process.env.NEXT_PUBLIC_DEMO_URL ?? "/sign-in"}
                note="One-time · Unlimited projects · Lifetime updates"
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
          title="A stronger B2B starting point without the usual starter-kit baggage"
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
                The surfaces your buyers expect, on{" "}
                <BrandItalic>day one</BrandItalic>.
              </>
            }
            description="Browse the product by category. Not three curated screenshots: the actual shell your users, admins, and teammates will interact with before you write your first custom feature."
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
                Most SaaS starters force the{" "}
                <BrandItalic>wrong tradeoff</BrandItalic>.
              </>
            }
          >
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                The lightweight ones get you to a login screen quickly, then
                leave teams, admin, billing depth, and product credibility for
                later. The heavy ones ship more architecture than you actually
                want to carry.
              </p>
              <p>
                This starter is built for technical founders who need a real
                B2B base now, but still want to move fast when the first custom
                features and rewrites start.
              </p>
              <p className="border-l-2 border-brand pl-4 text-foreground">
                Readable code. Product-ready foundations. No
                framework-within-a-framework.
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
          eyebrow="What ships"
          align="center"
          title={
            <>
              The B2B core most starters leave{" "}
              <BrandItalic>for later</BrandItalic>.
            </>
          }
          description="Not just auth and payments. The account, team, admin, and monetization surfaces that make a starter feel usable to a real customer."
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
          description="You get the serious B2B pieces up front, without buying months of extra cognitive load."
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
          eyebrow="Good fit"
          title={
            <>
              Best when your product needs to look{" "}
              <BrandItalic>real early</BrandItalic>.
            </>
          }
          description="The fit is narrow on purpose: products that need credibility and flexibility at the same time."
          className="mb-14"
        />

        <div className="border border-border bg-card p-8 md:p-10">
          <div className="mb-8 flex items-center gap-3">
            <span aria-hidden className="size-1.5 bg-brand" />
            <span className="label-mono">Best for</span>
          </div>

          <p className="mb-10 max-w-md text-base leading-relaxed text-muted-foreground">
            Start from a codebase that already handles the expensive product
            work founders usually postpone until it becomes painful.
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
              product foundation, already done.
            </>
          }
          description="You are not buying components. You are buying the slow B2B plumbing most serious SaaS products end up needing anyway."
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
              foundation yourself runs around:
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
                You pay today
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-[-0.03em] tabular-nums text-brand md:text-5xl">
                  ${pricingStatus.activeTier.price}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  one-time
                </span>
              </div>
              {pricingStatus.activeTier.id !== "standard" ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {pricingStatus.founding.active
                    ? `Next: $${pricingStatus.tiers.early.price} · Permanent: $${pricingStatus.tiers.standard.price}`
                    : `Permanent: $${pricingStatus.tiers.standard.price}`}
                </p>
              ) : null}
            </div>

            <p className="mt-auto pt-8 text-sm leading-relaxed text-muted-foreground">
              Every hour you do not spend rebuilding auth, billing rules,
              organizations, and admin is an hour you can spend on the thing
              customers will actually pay for.
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
          description="The product is production-ready. The price is early because you are. Full source code, unlimited end products, and the same starter you can inspect in the live demo."
          className="mb-14"
        />

        <PricingSection plans={pricingPlans} />

        <p className="mx-auto mt-10 max-w-2xl text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {pricingStatus.founding.active
            ? `Price ladder — once the ${pricingStatus.founding.total} founding seats are gone, the next price is $${pricingStatus.tiers.early.price}, then $${pricingStatus.tiers.standard.price}. This is the sharpest price Tenviq will ever sell at.`
            : pricingStatus.early.active
              ? `Early access — ${pricingStatus.early.remaining} seats left before the permanent $${pricingStatus.tiers.standard.price} price.`
              : `Standard pricing is now permanent.`}
        </p>
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
                Buy the starter, then build the part that&apos;s{" "}
                <BrandItalic>actually yours</BrandItalic>.
              </>
            }
          description="Skip the weeks of auth, billing, orgs, admin, and AI plumbing. Start from a base you can actually understand and sell from."
          primaryLabel="Buy the starter"
          primaryHref="#pricing"
          secondaryLabel="Read docs"
          secondaryHref="/docs"
        />
      </Section>
    </main>
  );
}
