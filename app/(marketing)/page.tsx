import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { AiProof } from "@/features/marketing/components/ai-proof";
import { BuilderSection } from "@/features/marketing/components/builder-section";
import { BuyerFaq } from "@/features/marketing/components/buyer-faq";
import { CodeProof } from "@/features/marketing/components/code-proof";
import { ComparisonSection } from "@/features/marketing/components/comparison-section";
import { IncludedItemsSection } from "@/features/marketing/components/included-items-section";
import { MarketingFeatureGrid } from "@/features/marketing/components/marketing-feature-grid";
import { ScreenshotsGallery } from "@/features/marketing/components/screenshots-gallery";
import { StarterPricing } from "@/features/marketing/components/starter-pricing";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/navigation";

export const metadata: Metadata = {
  title:
    "SaaS Starter - Next.js starter with auth, billing, and enforced plan gating",
  description:
    "The Next.js SaaS starter where billing actually controls your product. Auth, Stripe, plan gating, AI-ready monetization patterns, teams, and a polished dashboard. Built for technical founders.",
  openGraph: {
    title: "SaaS Starter - Auth, billing, and plan gating that actually works",
    description:
      "Gate features and enforce usage limits in two lines of code, then apply the same billing logic to AI-ready workflows. Buy once, own the code.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main>
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              The Next.js starter with billing 
              <span className="text-orange-500">and plan gating</span> built in
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Other starters connect Stripe and stop. This one ships enforced
              plan gating - capability checks, usage limits, and feature access
              control tied to billing. It also shows how to apply the same
              pattern to AI-ready workflows without bolting on a second system.
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
                  See What&apos;s Included
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Next.js 16 &middot; React 19 &middot; TypeScript &middot; Tailwind
              v4 &middot; Prisma &middot; Stripe &middot; $149 one-time
            </p>
          </div>
        </div>
      </section>

      <CodeProof />
      <AiProof />
      <MarketingFeatureGrid />
      <ScreenshotsGallery />
      <ComparisonSection />
      <IncludedItemsSection />

      <section id="stack" className="border-t py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
            Built with the modern stack you already know
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS 4",
              "shadcn/ui",
              "Prisma",
              "PostgreSQL",
              "Stripe",
              "Better Auth",
              "Resend",
            ].map((tech) => (
              <span key={tech} className="font-medium text-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <StarterPricing />
      <BuilderSection />
      <BuyerFaq />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Stop rebuilding. Start shipping.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Auth, billing, plan gating, teams, AI-ready monetization patterns,
              and 72 docs. Buy once, own the code, launch your SaaS this week.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="#pricing">
                <Button
                  size="lg"
                  className="w-full rounded-full text-lg sm:w-auto"
                >
                  Get the Starter - $149
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              One-time purchase &middot; Full source code &middot; 30-day refund
              policy
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
