import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Logo } from "./primitives";

const navItems = [
  { label: "What ships", href: "#features" },
  { label: "Stack", href: "#spec" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Live demo ↗", href: "#" },
  { label: "Docs", href: "#" },
];

export function SiteHeader() {
  return (
    <>
      <div className="border-b border-border bg-[linear-gradient(90deg,transparent,hsl(var(--brand-hsl)/0.12),transparent)] px-6 py-2.5 text-center font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
        <span className="font-medium text-brand">● FOUNDING PRICE</span>
        <span className="mx-3.5 opacity-40">—</span>
        <span>
          $99 today · goes to $149 once 20 founding seats are gone · lifetime
          updates
        </span>
      </div>
      <div className="mx-auto flex max-w-[1200px] items-center px-10 py-5">
        <Logo />
        <nav className="flex flex-1 justify-center gap-7 text-sm text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Button
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Buy · $99 →
          </Button>
        </div>
      </div>
    </>
  );
}
