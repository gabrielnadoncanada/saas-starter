import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CirclePlay,
  Code2,
  CreditCard,
  LayoutDashboard,
  Menu,
  Rocket,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const trustBadges = [
  "Next.js",
  "Auth",
  "Billing",
  "Teams",
  "Dashboard",
  "Settings",
  "Documentation",
];

const heroProofItems = [
  "Ship faster",
  "Easy to customize",
  "Billing ready",
  "Team ready",
];

const credibilityItems = [
  "Production-ready authentication",
  "Real subscription billing",
  "Team and workspace foundations",
  "Credible dashboard and settings",
  "Clear customization paths",
  "Built for fast product work",
];

const valueCards = [
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

const productPreviewCards = [
  {
    title: "Dashboard overview",
    description: "Product-ready layout with stats, activity, and navigation.",
    previewLabel: "Hero dashboard screenshot",
    thumbnails: ["Stats view", "Activity view"],
  },
  {
    title: "Billing foundations",
    description: "Plans, subscriptions, and monetization flows that feel real.",
    previewLabel: "Billing and plans screenshot",
    thumbnails: ["Plan selector", "Usage limits"],
  },
  {
    title: "Launch-ready settings",
    description: "Account and workspace surfaces that feel complete.",
    previewLabel: "Settings screenshot",
    thumbnails: ["Account", "Security"],
  },
  {
    title: "Team structure",
    description: "Support real SaaS usage without enterprise bloat.",
    previewLabel: "Workspace members screenshot",
    thumbnails: ["Members", "Roles"],
  },
];

const includedBlocks = [
  {
    title: "Core foundations",
    icon: Shield,
    items: [
      "Authentication flows",
      "Protected application area",
      "Account management",
      "Product-ready settings foundation",
      "Database-backed structure",
    ],
  },
  {
    title: "Monetization",
    icon: CreditCard,
    items: [
      "Subscription billing",
      "Plan structure",
      "Feature gating foundation",
      "Usage limit extensibility",
      "Billing-ready product model",
    ],
  },
  {
    title: "SaaS structure",
    icon: Users,
    items: [
      "Dashboard shell",
      "Team and workspace support",
      "Navigation foundations",
      "Extendable product architecture",
      "Real app starting point",
    ],
  },
  {
    title: "Developer experience",
    icon: Code2,
    items: [
      "Predictable file ownership",
      "Obvious naming patterns",
      "Straightforward feature extension",
      "Low-ceremony code organization",
      "Documentation for setup and customization",
    ],
  },
];

const proofCards = [
  {
    title: "Add a feature",
    description:
      "Create the schema, add the page, connect the action, and ship without wiring a mini-framework.",
    steps: ["Create schema", "Add page", "Connect action", "Ship"],
  },
  {
    title: "Extend billing",
    description:
      "Adjust plans, update feature gating, and evolve monetization without hunting through layers.",
    steps: ["Adjust plan", "Update gating", "Review limits", "Go live"],
  },
  {
    title: "Customize settings",
    description:
      "Edit account and workspace flows where you expect them, with direct ownership and fewer jumps.",
    steps: ["Edit section", "Save flow", "Validate UI", "Done"],
  },
];

const comparisonColumns = [
  {
    title: "Other boilerplates",
    items: [
      "Save too little time",
      "Look unfinished",
      "Need lots of rebuilding",
      "Weak monetization foundations",
      "Poor launch credibility",
    ],
    highlight: false,
  },
  {
    title: "Heavy starters",
    items: [
      "Harder to understand",
      "Too much ceremony",
      "Too many internal patterns",
      "Slower to customize",
      "Higher cognitive load",
    ],
    highlight: false,
  },
  {
    title: "This starter",
    items: [
      "Strong launch-ready base",
      "Clear product foundations",
      "Faster time to understand",
      "Faster time to modify",
      "Built for real buyer needs",
    ],
    highlight: true,
  },
];

const buyerFitItems = [
  "Solo founders launching faster",
  "Consultants and freelancers delivering SaaS faster",
  "Indie hackers who want leverage, not setup debt",
  "Small technical teams that need a strong base without enterprise heaviness",
];

const demoItems = [
  "Walk through the dashboard",
  "Review billing and plan foundations",
  "Explore settings and team structure",
  "See how fast common changes can be made",
];

const useCases = [
  "B2B SaaS products",
  "Client portals",
  "AI-powered SaaS tools",
  "Internal business software",
  "Niche vertical products",
  "Paid MVPs that need real monetization foundations",
];

const philosophyItems = [
  "Obviousness over purity",
  "Boundaries without ceremony",
  "Complexity only where it is earned",
  "Visible value over invisible sophistication",
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

const pricingItems = [
  "Full source code",
  "Auth foundations",
  "Billing and plan foundations",
  "Dashboard and settings",
  "Team / workspace structure",
  "Documentation",
  "Future updates",
];

const notRebuildingItems = [
  "Authentication",
  "Billing",
  "Plans and gating",
  "Dashboard structure",
  "Settings foundation",
  "Workspace support",
];

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
      {badge ? (
        <Badge variant="secondary" className="mx-auto">
          {badge}
        </Badge>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground text-base sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <Check className="text-primary mt-0.5 size-4 shrink-0" />
          <span className="text-sm sm:text-base">{item}</span>
        </div>
      ))}
    </div>
  );
}

function HeroPreview() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="bg-muted rounded-lg border p-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary size-2 rounded-full" />
                <div className="h-2 w-24 rounded bg-current/10" />
              </div>
              {[
                "Dashboard",
                "Billing",
                "Customers",
                "Workspace",
                "Settings",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>{item}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "MRR", value: "$4.8k" },
                { label: "Trials", value: "126" },
                { label: "Conversion", value: "8.4%" },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="space-y-2 p-4">
                    <p className="text-muted-foreground text-xs">
                      {item.label}
                    </p>
                    <p className="text-xl font-semibold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "New team invited to workspace",
                    "Pro plan upgraded successfully",
                    "AI feature usage limit updated",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md">
                        <Sparkles className="size-4" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Starter plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium">Pro</p>
                    <p className="text-muted-foreground text-xs">
                      Billing-ready foundation
                    </p>
                  </div>
                  <CheckList
                    items={["Auth ready", "Plan gating", "Workspace support"]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductPreview({
  title,
  description,
  previewLabel,
  thumbnails,
}: {
  title: string;
  description: string;
  previewLabel: string;
  thumbnails: string[];
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="bg-muted rounded-lg border p-4 space-y-3">
          <div className="bg-background flex aspect-[16/10] items-center justify-center rounded-md border text-center">
            <div className="space-y-2 px-4">
              <p className="text-sm font-medium">Placeholder</p>
              <p className="text-muted-foreground text-sm">{previewLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {thumbnails.map((item) => (
              <div
                key={item}
                className="bg-background text-muted-foreground flex h-14 items-center justify-center rounded-md border px-3 text-xs"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <section className="container mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary">Premium Next.js SaaS Starter</Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                Launch your Next.js SaaS faster — without rebuilding the same
                foundation again.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
                A premium SaaS starter for solo founders, consultants, indie
                hackers, and small technical teams who want to ship quickly,
                understand the code fast, and customize without friction.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2">
                Buy the Starter
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <CirclePlay className="size-4" />
                View Live Demo
              </Button>
            </div>

            <p className="text-muted-foreground text-sm">
              Start from a codebase built to help you launch, not one you need
              to decode first.
            </p>

            <div className="flex flex-wrap gap-2">
              {heroProofItems.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {trustBadges.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <HeroPreview />
        </div>

        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>
                Everything you need to launch with confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {credibilityItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <Check className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="space-y-5">
            <Badge variant="secondary">Positioning</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Most SaaS starters are either too bare or too heavy
            </h2>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {valueCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-muted/40">
        <div className="container mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <SectionHeader
            badge="Product previews"
            title="A starter that looks credible from day one"
            description="Good foundations matter. But perceived quality matters too. This starter ships with product-ready surfaces that help your SaaS feel trustworthy immediately."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {productPreviewCards.map((card) => (
              <ProductPreview
                key={card.title}
                title={card.title}
                description={card.description}
                previewLabel={card.previewLabel}
                thumbnails={card.thumbnails}
              />
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <SectionHeader
          badge="Included"
          title="What’s included"
          description="Everything you need to stop rebuilding the same SaaS basics and start shipping faster."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {includedBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Card key={block.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{block.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CheckList items={block.items} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="container mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <SectionHeader
            badge="Proof"
            title="Built to be modified, not admired"
            description="The promise is not just cleaner code. It is faster product work when you need to add features, extend billing, or customize settings."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {proofCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {card.steps.map((step) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <Check className="text-primary size-4" />
                      <span>{step}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <SectionHeader
          badge="Comparison"
          title="Why this starter feels different"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {comparisonColumns.map((column) => (
            <Card
              key={column.title}
              className={
                column.highlight ? "border-primary shadow-sm" : undefined
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{column.title}</CardTitle>
                  {column.highlight ? <Badge>Best fit</Badge> : null}
                </div>
                {column.highlight ? (
                  <CardDescription>
                    The option built for real buyer needs.
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardContent>
                <CheckList items={column.items} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section
        id="demo"
        className="container mx-auto max-w-7xl px-6 py-20 sm:py-24"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          $1
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Demo
              </Badge>
              <CardTitle className="text-3xl">
                See the product. See the code. See the speed.
              </CardTitle>
              <CardDescription className="text-base">
                The fastest way to evaluate a starter is not by reading feature
                lists. It is by seeing the product surfaces, the code structure,
                and the modification flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CheckList items={demoItems} />
              <Button variant="outline" className="gap-2">
                <CirclePlay className="size-4" />
                Watch the Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Use cases
              </Badge>
              <CardTitle className="text-3xl">Use it to build</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {useCases.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border px-4 py-3 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Start from a foundation that already solves the expensive,
                repetitive parts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Philosophy
              </Badge>
              <CardTitle className="text-3xl">
                A better starter is not the one with the most layers
              </CardTitle>
              <CardDescription className="text-base">
                It is the one that helps you launch with less hesitation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CheckList items={philosophyItems} />
              <p className="text-muted-foreground text-sm sm:text-base">
                Because buyers do not pay for architecture theater. They pay for
                faster progress.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="faq" className="bg-muted/40">
        <div className="container mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <SectionHeader badge="FAQ" title="Frequently asked questions" />

          <Card className="mt-12">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={item.question} value={`item-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section
        id="pricing"
        className="container mx-auto max-w-7xl px-6 py-20 sm:py-24"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="space-y-6">
            <Badge variant="secondary">Pricing</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Buy back weeks of foundation work
              </h2>
              <p className="text-muted-foreground max-w-3xl text-base sm:text-lg">
                Instead of rebuilding auth, billing, settings, plans, dashboard
                structure, and team foundations again, start from a SaaS base
                designed to help you launch faster and modify confidently.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What you are not rebuilding</CardTitle>
                <CardDescription>
                  The expensive repetitive foundation work that slows launches
                  down.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {notRebuildingItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-md border px-3 py-3 text-sm"
                    >
                      <Check className="text-primary size-4" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <Badge>Best for solo founders</Badge>
                <span className="text-sm text-muted-foreground">
                  One-time purchase
                </span>
              </div>
              <CardTitle className="flex items-center justify-between gap-4 text-2xl">
                <span>Starter</span>
                <span>$249</span>
              </CardTitle>
              <CardDescription>
                Built for technical buyers who care about speed, clarity, and
                launch readiness.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <p className="font-medium">Buy back weeks of setup work</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Start from a premium base instead of rebuilding the same
                  foundations again.
                </p>
              </div>
              <CheckList items={pricingItems} />
              <div className="text-muted-foreground text-sm">
                Future updates. Docs included. Production-ready foundations.
              </div>
              <Button className="w-full gap-2" size="lg">
                Buy the Starter
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <Card className="border-primary/40">
          <CardContent className="flex flex-col items-center gap-6 p-10 text-center sm:p-12">
            <Badge variant="secondary">Ready to launch</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Stop rebuilding the same SaaS foundation
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
                Launch faster with a starter built to help you understand
                quickly, customize safely, and ship with confidence.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2">
                Buy the Starter
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <CirclePlay className="size-4" />
                View Live Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {heroProofItems.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
