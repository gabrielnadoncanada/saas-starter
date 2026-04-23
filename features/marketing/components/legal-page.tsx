import type { ReactNode } from "react";

import { siteConfig } from "@/config/site.config";

export type LegalSection = {
  id: string;
  index: string;
  label: string;
  title: string;
  body: ReactNode;
};

export type LegalPageMeta = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  lastUpdated: string;
  effective: string;
  version: string;
  footerLabel: string;
};

type LegalPageProps = {
  sections: LegalSection[];
  meta: LegalPageMeta;
};

export function LegalPage({ sections, meta }: LegalPageProps): ReactNode {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <header className="border-b border-border pb-10">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-brand" />
          <span className="label-mono">{meta.eyebrow}</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.025em] md:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {meta.description}
        </p>
        <dl className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
          <MetaItem label="Last updated" value={meta.lastUpdated} />
          <MetaItem label="Effective" value={meta.effective} />
          <MetaItem label="Version" value={meta.version} mono />
        </dl>
      </header>

      <nav
        aria-label="Sections"
        className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-baseline gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {section.index}
            </span>
            <span className="text-sm font-medium group-hover:text-brand">
              {section.title}
            </span>
          </a>
        ))}
      </nav>

      <div className="mt-16 space-y-20">
        {sections.map((section) => (
          <LegalSectionBlock key={section.id} {...section} />
        ))}
      </div>

      <footer className="mt-24 border-t border-border pt-10">
        <p className="label-mono">{meta.footerLabel}</p>
        <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
          {siteConfig.name} &middot; v{meta.version} &middot; {meta.effective}
        </p>
      </footer>
    </main>
  );
}

type MetaItemProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function MetaItem({ label, value, mono }: MetaItemProps): ReactNode {
  return (
    <div className="bg-card px-4 py-3">
      <dt className="label-mono">{label}</dt>
      <dd
        className={
          mono
            ? "mt-1 font-mono text-sm tabular-nums"
            : "mt-1 text-sm font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function LegalSectionBlock({
  id,
  index,
  label,
  title,
  body,
}: LegalSection): ReactNode {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="grid gap-6 md:grid-cols-[140px_1fr] md:gap-10">
        <div className="md:pt-1">
          <p className="label-mono">
            {index} &mdash; {label}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-[28px]">
            {title}
          </h2>
          <div className="legal-prose mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-brand/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-brand [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.65em] [&_li]:before:size-1 [&_li]:before:bg-brand [&_ul]:space-y-2">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}
