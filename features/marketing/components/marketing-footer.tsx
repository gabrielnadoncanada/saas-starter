import Link from "next/link";
import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

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
        "relative border-t border-border bg-background",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
      />

      <div className="container mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_2fr] md:py-20">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center">
              {logo}
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="label-mono">{section.title}</h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span
                          aria-hidden
                          className="h-px w-2 bg-border transition-all group-hover:w-4 group-hover:bg-brand"
                        />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border py-6 sm:flex-row sm:items-center">
          <span className="label-mono">{copyright}</span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="label-mono">{siteConfig.footerEdition}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
