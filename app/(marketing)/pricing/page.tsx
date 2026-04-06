import type { Metadata } from "next";

import { FaqSection } from "@/features/billing/components/faq-section";
import { PricingSection } from "@/features/billing/components/pricing-section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. Choose the plan that fits your team and start building today.",
  openGraph: {
    title: "Pricing - SaaS Starter",
    description:
      "Simple, transparent pricing for solo founders and small teams.",
  },
};

export const revalidate = 3600;

export default async function PricingPage() {
  return (
    <>
      <section className="bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PricingSection />
        </div>
      </section>
      <FaqSection />
    </>
  );
}
