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
    <footer className={cn("border-t bg-muted/30", className)}>
      <div className="container mx-auto max-w-7xl grid gap-10 px-4 py-12 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <div>{logo}</div>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            {description}
          </p>
          <p className="text-muted-foreground text-xs">{copyright}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:justify-self-end">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
