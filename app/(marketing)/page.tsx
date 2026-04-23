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
  ScreenshotGallery,
  Section,
  SectionHeading,
} from "@/features/marketing/components";
import { comparisonColumns } from "@/features/marketing/data/comparison-columns";
import { faqItems } from "@/features/marketing/data/faq-items";
import { featureColumns } from "@/features/marketing/data/feature-columns";
import { galleryCategories } from "@/features/marketing/data/gallery-categories";
import { timeSavedBreakdown } from "@/features/marketing/data/time-saved-breakdown";
import { getStarterPricingStatus } from "@/config/pricing.config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tenviq — Next.js SaaS Starter for Real B2B Foundations",
  description:
    "Tenviq is a production-ready Next.js SaaS starter for technical founders who need auth, Stripe billing, organizations, admin, and AI without buying a heavy starter kit.",
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

const useCases = [
  "B2B SaaS with team workspaces and invitations",
  "AI SaaS products with gated plans and usage limits",
  "Vertical SaaS that needs admin and account surfaces on day one",
  "Paid MVPs that need to look credible in demos and sales calls",
  "Products that must grow from first user to first team account without a rewrite",
];

const pricingStatus = getStarterPricingStatus();
const { tiers, founding, early, activeTier } = pricingStatus;
const isStandardActive = activeTier.id === "standard";

function primaryCtaLabel(): string {
  if (founding.active)
    return `Claim a founding seat — $${tiers.founding.price}`;
  if (early.active) return `Get early access — $${tiers.early.price}`;
  return `Buy Tenviq — $${tiers.standard.price}`;
}

const primaryCta = { label: primaryCtaLabel(), href: "#pricing" };
const demoHref = process.env.NEXT_PUBLIC_DEMO_URL ?? "/sign-in";

const commonPlanFeatures = [
  "Auth, billing, teams, admin, AI, and docs included",
  "1 developer seat",
  "Unlimited end products",
  "Commercial usage",
  "Lifetime updates",
  "Private GitHub access",
  "Live demo access before you buy",
];

function earlyPriceNote(): string {
  if (founding.active) return "Unlocks once founding is sold";
  if (early.active) return `${early.remaining} early seats left`;
  return "Sold out";
}

function earlyCtaLabel(): string {
  if (early.active) return `Get early access — $${tiers.early.price}`;
  if (founding.active) return "Unlocks after founding";
  return "Early access sold out";
}

const pricingPlans = [
  {
    name: "Founding",
    description:
      "For the first 10 builders who want the sharpest price and a direct line on what ships next.",
    price: `$${tiers.founding.price}`,
    period: "one-time",
    priceNote: founding.active
      ? `${founding.remaining} of ${founding.total} founding seats left`
      : "Sold out",
    href: tiers.founding.href,
    ctaLabel: founding.active
      ? `Claim a founding seat — $${tiers.founding.price}`
      : "Founding seats sold out",
    features: ["Direct input on what ships next", ...commonPlanFeatures],
    badge: founding.active ? "Only 10 seats" : "Sold out",
    highlighted: founding.active,
    disabled: !founding.active,
  },
  {
    name: "Early access",
    description:
      "For the next 20 builders. Locked-in price before the permanent tier kicks in.",
    price: `$${tiers.early.price}`,
    period: "one-time",
    priceNote: earlyPriceNote(),
    href: tiers.early.href,
    ctaLabel: earlyCtaLabel(),
    features: commonPlanFeatures,
    badge: early.active ? "Limited to 20 total" : "Next tier",
    highlighted: early.active,
    disabled: !early.active,
  },
  {
    name: "Standard",
    description: "The permanent price once early-access seats are filled.",
    price: `$${tiers.standard.price}`,
    period: "one-time",
    priceNote: isStandardActive ? "Available now" : "Permanent price",
    href: tiers.standard.href,
    ctaLabel: isStandardActive
      ? `Buy Tenviq — $${tiers.standard.price}`
      : "Available after early access",
    features: commonPlanFeatures,
    badge: "Permanent",
    highlighted: isStandardActive,
    disabled: !isStandardActive,
  },
];

const totalHoursSaved = timeSavedBreakdown.reduce(
  (acc, item) => acc + item.hours,
  0,
);
const contractorRate = 75;
const totalDevCost = totalHoursSaved * contractorRate;

function BrandItalic({ children }: { children: React.ReactNode }) {
  return (
    <em className="font-serif italic font-normal text-brand tracking-[-0.01em]">
      {children}
    </em>
  );
}

function priceLadderCopy(): string {
  if (founding.active) {
    return `Price ladder — once the ${founding.total} founding seats are gone, the next price is $${tiers.early.price}, then $${tiers.standard.price}. This is the sharpest price Tenviq will ever sell at.`;
  }
  if (early.active) {
    return `Early access — ${early.remaining} seats left before the permanent $${tiers.standard.price} price.`;
  }
  return "Standard pricing is now permanent.";
}

function finalCtaBadge(): string {
  if (founding.active) return `${founding.remaining} founding seats left`;
  if (early.active) return `${early.remaining} early seats left`;
  return "Ready to launch";
}

export default function MarketingPage() {
  return (
    <main className="flex-1">
      <section className="relative">
        <div className="container mx-auto max-w-7xl px-6 pt-20 pb-32 md:px-10 md:pt-28 md:pb-40">
          <Hero
            pill={
              <AnnouncementPill
                label={
                  founding.active
                    ? `${founding.remaining} / ${founding.total} left`
                    : "v1.0"
                }
                text={
                  founding.active
                    ? `Founding seats at $${tiers.founding.price} — grab one before the price moves to $${tiers.early.price}`
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
                primaryLabel={primaryCta.label}
                primaryHref={primaryCta.href}
                secondaryLabel="Try the live demo first"
                secondaryHref={demoHref}
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
            imageAlt="A dashboard that feels like a real product, not a demo"
            imageSrcDark={`/marketing/screenshots/dark/dashboard.png`}
            imageSrcLight={`/marketing/screenshots/light/dashboard.png`}
          />
        </div>
      </section>

      <Section id="value">
        <SectionHeading
          align="center"
          index="01"
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
                  ${activeTier.price}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  one-time
                </span>
              </div>
              {!isStandardActive ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {founding.active
                    ? `Next: $${tiers.early.price} · Permanent: $${tiers.standard.price}`
                    : `Permanent: $${tiers.standard.price}`}
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

      <Section id="gallery" containerClassName="py-20 md:py-24">
        <SectionHeading
          index="02"
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
            index="03"
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
                This starter is built for technical founders who need a real B2B
                base now, but still want to move fast when the first custom
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
          index="04"
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
          index="05"
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
          index="06"
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

      <Section id="how-it-works">
        <SectionHeading
          align="center"
          index="07"
          eyebrow="After you buy"
          title={
            <>
              From pay to <BrandItalic>pnpm dev</BrandItalic> in under 10
              minutes.
            </>
          }
          description="No long onboarding, no enterprise hand-off. Pay, get pushed into your private repo, run one command, start shipping."
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Pay",
              body: "Stripe checkout for the founding tier. One payment, no subscription, no seat negotiation.",
              hint: "~30 seconds",
            },
            {
              step: "02",
              title: "Get invited to the private repo",
              body: "Your GitHub account is added to the Tenviq private repository automatically. Full source code, full history, full commercial license.",
              hint: "~2 minutes",
            },
            {
              step: "03",
              title: "Clone, run, ship",
              body: "Clone the repo, run `pnpm setup` and `pnpm dev`. You are now on localhost with the same product you saw in the live demo, ready to make it yours.",
              hint: "~5 minutes",
            },
          ].map((step) => (
            <div key={step.step} className="flex flex-col bg-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="font-mono text-[11px] tabular-nums text-brand">
                  {step.step}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border" />
                <span className="label-mono">{step.hint}</span>
              </div>
              <h3 className="mb-4 text-lg font-semibold tracking-[-0.015em]">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pricing">
        <SectionHeading
          align="center"
          index="08"
          eyebrow="Pricing"
          title={
            <>
              One-time payment. <BrandItalic>No subscription.</BrandItalic>{" "}
              Lifetime updates.
            </>
          }
          description="The product is production-ready. The price is early because you are. Full source code, unlimited end products, and the same starter you can inspect in the live demo."
          className="mb-10"
        />

        <ul className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
          {[
            {
              label: "Try before you buy",
              body: "Full live demo. Click every button before paying.",
            },
            {
              label: "Private GitHub access",
              body: "Invited to the repo the moment the payment clears.",
            },
            {
              label: "Lifetime updates",
              body: "Every future release pushed to your private repo.",
            },
          ].map((item) => (
            <li
              key={item.label}
              className="flex flex-col gap-2 bg-card px-5 py-4"
            >
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
                <span aria-hidden className="size-1 bg-brand" />
                {item.label}
              </span>
              <span className="text-sm leading-relaxed text-foreground">
                {item.body}
              </span>
            </li>
          ))}
        </ul>

        <PricingSection plans={pricingPlans} />

        <p className="mx-auto mt-10 max-w-2xl text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {priceLadderCopy()}
        </p>
      </Section>

      <Section id="faq">
        <SectionHeading
          index="09"
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
          badge={finalCtaBadge()}
          title={
            founding.active ? (
              <>
                Claim a founding seat at{" "}
                <BrandItalic>${tiers.founding.price}</BrandItalic>, then build
                the part that&apos;s actually yours.
              </>
            ) : (
              <>
                Buy the starter, then build the part that&apos;s{" "}
                <BrandItalic>actually yours</BrandItalic>.
              </>
            )
          }
          description="Skip the weeks of auth, billing, orgs, admin, and AI plumbing. Start from a base you can actually understand and sell from."
          primaryLabel={primaryCta.label}
          primaryHref={primaryCta.href}
          secondaryLabel="Try the live demo"
          secondaryHref={demoHref}
        />
      </Section>
    </main>
  );
}
