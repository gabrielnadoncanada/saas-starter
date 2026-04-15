import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

export type FooterSection = {
  title: string;
  links: { label: string; href: string }[];
};

export type MarketingFooterProps = {
  logo: React.ReactNode;
  description: string;
  copyright: string;
  sections: FooterSection[];
  className?: string;
};

export function MarketingFooter({
  logo,
  description,
  copyright,
  sections,
  className,
}: MarketingFooterProps) {
  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t border-border bg-foreground text-background dark:bg-background dark:text-foreground",
        className,
      )}
    >
      <div
        aria-hidden
        className="bg-grid absolute inset-0 text-background opacity-[0.04] dark:text-foreground"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-brand/30 blur-[140px]"
      />

      <div className="relative container mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.4fr_2fr] md:px-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-brand" aria-hidden />
            {logo}
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-background/70 dark:text-foreground/70">
            {description}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50 dark:text-foreground/50">
            {copyright}
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50 dark:text-foreground/50">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-background/80 transition-colors hover:text-background dark:text-foreground/80 dark:hover:text-foreground"
                    >
                      <span className="h-px w-3 bg-background/30 transition-all group-hover:w-5 group-hover:bg-brand dark:bg-foreground/30" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-background/10 dark:border-foreground/10">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 font-mono text-[10px] uppercase tracking-[0.22em] text-background/40 md:px-10 dark:text-foreground/40">
          <span>Built for builders</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 bg-brand animate-brand-pulse" aria-hidden />
            All systems nominal
          </span>
        </div>
      </div>
    </footer>
  );
}
