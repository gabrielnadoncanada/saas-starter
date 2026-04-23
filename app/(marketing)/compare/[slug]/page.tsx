import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Section } from "@/features/marketing/components/section";
import { cn } from "@/lib/utils";

import { ComparisonTable } from "../_components/comparison-table";
import { comparisons, getComparisonBySlug } from "../_data/comparisons";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return {};
  return {
    title: `${comparison.title} — Which SaaS starter should you pick?`,
    description: comparison.description,
    alternates: { canonical: `/compare/${comparison.slug}` },
    openGraph: {
      title: comparison.title,
      description: comparison.description,
      type: "article",
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const {
    competitor,
    tagline,
    chooseCompetitorWhen,
    chooseTenviqWhen,
    sideBySide,
    featureTable,
    verdict,
  } = comparison;

  const others = comparisons.filter((c) => c.slug !== comparison.slug);

  return (
    <main>
      {/* HERO */}
      <Section>
        <div className="mx-auto max-w-4xl py-24 md:py-32">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden>←</span>
            All comparisons
          </Link>

          <h1 className="mt-10 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.03em] md:text-7xl">
            Tenviq{" "}
            <span className="font-mono text-2xl font-normal uppercase tracking-[0.22em] text-muted-foreground md:text-3xl">
              vs
            </span>{" "}
            <span className="text-muted-foreground">{competitor}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            {tagline}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/#pricing">See Tenviq pricing</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Try the live demo</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* DECISION LANES */}
      <Section className="border-t border-border">
        <div className="mx-auto max-w-5xl py-20">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="size-1.5 bg-brand" />
            The decision, in two lists
          </p>
          <h2 className="mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            One of these should describe your project.
          </h2>

          <div className="mt-14 grid border-y border-border md:grid-cols-2">
            <div className="flex flex-col gap-6 border-b border-border py-10 pr-0 md:border-b-0 md:border-r md:pr-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Pick {competitor} if
              </p>
              <ul className="flex flex-col gap-4">
                {chooseCompetitorWhen.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 bg-muted-foreground/60"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6 py-10 md:pl-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
                <span aria-hidden className="mr-2 inline-block size-1.5 bg-brand align-middle" />
                Pick Tenviq if
              </p>
              <ul className="flex flex-col gap-4">
                {chooseTenviqWhen.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 bg-brand"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* SIDE BY SIDE */}
      <Section className="border-t border-border">
        <div className="mx-auto max-w-5xl py-20">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="size-1.5 bg-brand" />
            Six angles that decide it
          </p>
          <h2 className="mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Where {competitor} and Tenviq actually differ.
          </h2>

          <div className="mt-14 border-y border-border">
            {sideBySide.map((row, i) => (
              <div
                key={row.topic}
                className={cn(
                  "grid gap-6 py-8 md:grid-cols-[180px_1fr_1fr] md:gap-10 md:py-10",
                  i > 0 && "border-t border-border",
                )}
              >
                <div className="flex items-baseline gap-4 md:flex-col md:items-start md:gap-2">
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold tracking-[-0.01em] text-foreground md:text-xl">
                    {row.topic}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {competitor}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    {row.competitor}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
                    Tenviq
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">
                    {row.tenviq}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FEATURE MATRIX */}
      <Section className="border-t border-border">
        <div className="mx-auto max-w-5xl py-20">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="size-1.5 bg-brand" />
            Feature matrix
          </p>
          <h2 className="mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Row by row, what ships by default.
          </h2>

          <div className="mt-14">
            <ComparisonTable rows={featureTable} competitor={competitor} />
          </div>
        </div>
      </Section>

      {/* VERDICT */}
      <Section className="border-t border-border">
        <div className="mx-auto max-w-4xl py-24 md:py-32">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span aria-hidden className="size-1.5 bg-brand" />
            Bottom line
          </p>
          <p className="mt-10 border-l-2 border-brand pl-6 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em] md:pl-10 md:text-4xl lg:text-5xl">
            {verdict}
          </p>
          <div className="mt-12 flex flex-wrap gap-3 md:pl-10">
            <Button asChild size="lg">
              <Link href="/#pricing">Get Tenviq</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Try the live demo</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* OTHER COMPARISONS */}
      <Section>
        <div className="mx-auto max-w-5xl py-20">
          <div className="flex items-end justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Keep comparing
            </p>
            <Link
              href="/compare"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
            >
              See all →
            </Link>
          </div>

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {others.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-6"
                >
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold tracking-[-0.01em] text-foreground transition-colors group-hover:text-brand md:text-xl">
                    Tenviq{" "}
                    <span className="font-mono text-xs font-normal uppercase tracking-[0.22em] text-muted-foreground">
                      vs
                    </span>{" "}
                    <span className="text-muted-foreground group-hover:text-brand">
                      {c.competitor}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-brand"
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
