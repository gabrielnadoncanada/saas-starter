import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Section } from "@/features/marketing/components/section";
import { SectionHeading } from "@/features/marketing/components/section-heading";
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
    title,
    tagline,
    chooseCompetitorWhen,
    chooseTenviqWhen,
    sideBySide,
    featureTable,
    tenviqWins,
    competitorWins,
    verdict,
  } = comparison;

  return (
    <main>
      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 py-24 md:py-32">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Compare
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">{tagline}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/#pricing">See Tenviq pricing</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Try the live demo</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section variant="muted">
        <div className="mx-auto grid max-w-5xl gap-8 py-20 md:grid-cols-2">
          <div className="flex flex-col gap-4 border border-border bg-background p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Choose {competitor} if
            </p>
            <ul className="flex flex-col gap-3 text-sm text-foreground">
              {chooseCompetitorWhen.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 border border-brand/40 bg-background p-6 ring-1 ring-brand/20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand">
              Choose Tenviq if
            </p>
            <ul className="flex flex-col gap-3 text-sm text-foreground">
              {chooseTenviqWhen.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-5xl flex-col gap-10 py-20">
          <SectionHeading
            index="01"
            eyebrow="Side by side"
            title={`Where Tenviq and ${competitor} differ`}
            description={`Six angles that usually decide which starter fits your project.`}
          />
          <div className="grid gap-0 border border-border">
            {sideBySide.map((row, i) => (
              <div
                key={row.topic}
                className={cn(
                  "grid gap-4 p-6 md:grid-cols-[180px_1fr_1fr] md:gap-8",
                  i > 0 && "border-t border-border",
                )}
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {row.topic}
                </div>
                <div className="text-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {competitor}
                  </p>
                  <p className="mt-2 text-foreground">{row.competitor}</p>
                </div>
                <div className="text-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
                    Tenviq
                  </p>
                  <p className="mt-2 text-foreground">{row.tenviq}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section variant="muted">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 py-20">
          <SectionHeading
            index="02"
            eyebrow="Feature table"
            title={`Tenviq vs ${competitor}, feature by feature`}
            description="Quick reference. A filled dot means the capability ships by default."
          />
          <ComparisonTable rows={featureTable} competitor={competitor} />
        </div>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-5xl gap-8 py-20 md:grid-cols-2">
          <div className="flex flex-col gap-4 border border-brand/40 bg-background p-8 ring-1 ring-brand/20">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand">
              What Tenviq wins
            </p>
            <ul className="flex flex-col gap-3 text-sm text-foreground">
              {tenviqWins.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 border border-border bg-background p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              What {competitor} wins
            </p>
            <ul className="flex flex-col gap-3 text-sm text-foreground">
              {competitorWins.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section variant="inverted">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 py-24 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-70">
            Bottom line
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {verdict}
          </h2>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/#pricing">Get Tenviq</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/30 text-background hover:bg-background/10"
            >
              <Link href="/sign-in">Try the live demo first</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-4 py-16 text-sm text-muted-foreground">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]">
            Other comparisons
          </p>
          <ul className="flex flex-wrap gap-2">
            {comparisons
              .filter((c) => c.slug !== comparison.slug)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/compare/${c.slug}`}
                    className="inline-flex items-center border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-brand hover:text-brand"
                  >
                    Tenviq vs {c.competitor}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </Section>
    </main>
  );
}
