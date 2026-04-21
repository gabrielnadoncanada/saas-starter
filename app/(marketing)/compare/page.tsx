import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/features/marketing/components/section";

import { comparisons } from "./_data/comparisons";

export const metadata: Metadata = {
  title: "Compare Tenviq to every other Next.js SaaS starter",
  description:
    "Honest comparisons between Tenviq and the other Next.js SaaS starters (Makerkit, Supastarter, Next-Forge, Divjoy, ShipFast). Pick the one that fits your roadmap.",
  alternates: { canonical: "/compare" },
};

export default function CompareIndexPage() {
  return (
    <main>
      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 py-24 md:py-32">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Compare
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            How Tenviq compares to every other Next.js SaaS starter
          </h1>
          <p className="text-lg text-muted-foreground">
            We only win when your roadmap actually needs B2B depth. These pages
            help you pick the right starter — not always Tenviq. Read the one
            closest to your decision and choose with eyes open.
          </p>
        </div>
      </Section>

      <Section variant="muted">
        <div className="mx-auto grid max-w-5xl gap-4 py-20 md:grid-cols-2">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group flex flex-col gap-3 border border-border bg-background p-6 transition hover:border-brand hover:shadow-sm"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-brand">
                Tenviq vs {c.competitor}
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {c.title}
              </h2>
              <p className="text-sm text-muted-foreground">{c.tagline}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand">
                Read the comparison
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
