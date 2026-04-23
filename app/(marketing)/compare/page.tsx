import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
      <Section containerClassName="mx-auto max-w-4xl">
        <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden className="size-1.5 bg-brand" />
          Comparisons · {String(comparisons.length).padStart(2, "0")}
        </p>
        <h1 className="mt-8 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.03em] md:text-6xl lg:text-7xl">
          We only win when B2B depth{" "}
          <span className="text-brand">is on your roadmap</span>.
        </h1>
        <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Five honest comparisons with every other serious Next.js SaaS starter.
          Read the one closest to your decision — we tell you when to pick them.
        </p>
      </Section>

      <Section className="border-t border-border">
        <div className="mx-auto max-w-4xl">
          <ul className="divide-y divide-border border-y border-border">
            {comparisons.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-10 md:gap-10 md:py-14"
                >
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-3">
                    <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-brand md:text-5xl">
                      Tenviq{" "}
                      <span className="font-mono text-base font-normal uppercase tracking-[0.22em] text-muted-foreground md:text-lg">
                        vs
                      </span>{" "}
                      {c.competitor}
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                      {c.tagline}
                    </p>
                  </div>

                  <ArrowRight
                    className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-brand md:size-6"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </main>
  );
}
