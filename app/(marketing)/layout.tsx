import { LogoPeriod } from "@/features/marketing/components/logo-period";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { MarketingHeader } from "@/features/marketing/components/marketing-header";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

const footerSections = [
  { title: "Company", links: [{ href: "/about", label: "About" }] },
  { title: "Resources", links: [{ href: "/blog", label: "Blog" }] },
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
        signInHref="/auth/sign-in"
        signUpHref="/auth/sign-up"
      />
      <div className="flex-1">{children}</div>
      <MarketingFooter
        logo={<LogoPeriod />}
        description="Built for solo founders, consultants, indie hackers, and small technical teams who want to ship quickly without rebuilding the same product foundation again."
        copyright="© 2026 Tenviq. All rights reserved."
        sections={footerSections}
      />
    </div>
  );
}
