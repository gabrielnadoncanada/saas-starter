import Link from "next/link";

import { Logo } from "./primitives";

const groups: Array<[string, string[]]> = [
  ["Product", ["Live demo", "What ships", "Stack", "Pricing"]],
  ["Resources", ["Docs", "Changelog", "License", "Blog"]],
  ["Legal", ["Privacy", "Terms", "Contact"]],
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-10 pb-9 pt-12">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <div className="mt-3.5 max-w-[280px] text-[13px] leading-[1.55] text-muted-foreground">
            The Next.js SaaS starter for technical founders building real B2B
            products.
          </div>
        </div>
        {groups.map(([h, ls]) => (
          <div key={h}>
            <div className="mb-3.5 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
              {h.toUpperCase()}
            </div>
            {ls.map((l) => (
              <Link
                key={l}
                href="#"
                className="block py-1 text-[13px] text-foreground transition-colors hover:text-brand"
              >
                {l}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-9 flex max-w-[1200px] justify-between border-t border-border pt-5 font-mono text-[11px] tracking-[0.15em] text-muted-foreground/60">
        <span>© 2026 TENVIQ · ALL RIGHTS RESERVED</span>
        <span>EDITION 2026</span>
      </div>
    </footer>
  );
}
