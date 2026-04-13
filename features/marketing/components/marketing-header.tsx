"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

const marketingSectionHrefs = {
  compare: "/#compare",
  faq: "/#faq",
  features: "/#features",
  pricing: "/#pricing",
  screenshots: "/#screenshots",
} as const;

const navLinks = [
  { label: "Features", href: marketingSectionHrefs.features },
  { label: "Screenshots", href: marketingSectionHrefs.screenshots },
  { label: "Comparison", href: marketingSectionHrefs.compare },
  { label: "Pricing", href: marketingSectionHrefs.pricing },
  { label: "FAQ", href: marketingSectionHrefs.faq },
];

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link href={routes.marketing.home} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-sm font-bold text-white">
            S
          </div>
          <span className="text-base font-semibold text-foreground">
            SaaS Starter
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href={routes.auth.login}>
            <Button variant="ghost" size="sm">
              Demo
            </Button>
          </Link>
          <a href={marketingSectionHrefs.pricing}>
            <Button size="sm" className="rounded-full">
              Get the Starter
            </Button>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              <Link
                href={routes.auth.login}
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="outline" size="sm" className="w-full">
                  Demo
                </Button>
              </Link>
              <a
                href={marketingSectionHrefs.pricing}
                onClick={() => setMobileOpen(false)}
              >
                <Button size="sm" className="w-full rounded-full">
                  Get the Starter
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
