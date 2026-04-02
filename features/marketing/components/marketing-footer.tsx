import { Link } from "@/shared/i18n/navigation";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Screenshots", href: "/#screenshots" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Comparison", href: "/#compare" },
  { label: "FAQ", href: "/#faq" },
];

const resourceLinks = [
  { label: "Demo", href: "/sign-in" },
  { label: "Documentation", href: "/#faq" },
  { label: "Tech Stack", href: "/#stack" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-sm font-bold text-white">
                S
              </div>
              <span className="text-base font-semibold text-foreground">
                SaaS Starter
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The Next.js starter with auth, billing, and enforced plan gating
              built in. Buy once, own the code.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <ul className="mt-3 space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SaaS Starter. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js 16, React 19, TypeScript, and Tailwind v4.
          </p>
        </div>
      </div>
    </footer>
  );
}

