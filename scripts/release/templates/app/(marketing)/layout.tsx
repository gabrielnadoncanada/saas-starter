import { LogoPeriod } from "@/features/marketing/components/logo-period";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { MarketingHeader } from "@/features/marketing/components/marketing-header";

const navigationLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Contact" },
];

const footerSections = [
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/blog", label: "Blog" },
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
          label: "Sign in",
          href: "/sign-in",
        }}
        primaryAction={{ label: "Get started", href: "/sign-up" }}
      />
      <div className="flex-1">{children}</div>
      <MarketingFooter
        logo={<LogoPeriod />}
        description="A Next.js SaaS starter with auth, billing, organizations, and admin — ready to customize."
        copyright={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
        sections={footerSections}
      />
    </div>
  );
}
