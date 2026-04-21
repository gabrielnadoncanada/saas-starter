import { LogoPeriod } from "@/features/marketing/components/logo-period";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { MarketingHeader } from "@/features/marketing/components/marketing-header";

const navigationLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Contact" },
];

const footerSections = [
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/blog", label: "Blog" },
      { href: "/compare", label: "Compare" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/license", label: "License" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader
        logo={<LogoPeriod />}
        links={navigationLinks}
        secondaryAction={{
          label: "Demo",
          href: process.env.NEXT_PUBLIC_DEMO_URL ?? "/sign-in",
        }}
        primaryAction={{ label: "Buy the starter", href: "/#pricing" }}
      />
      <div className="flex-1">{children}</div>
      <MarketingFooter
        logo={<LogoPeriod />}
        description="Built for technical founders who want real B2B SaaS foundations without buying a heavy starter kit they will spend weeks decoding."
        copyright="© 2026 Tenviq. All rights reserved."
        sections={footerSections}
      />
    </div>
  );
}
