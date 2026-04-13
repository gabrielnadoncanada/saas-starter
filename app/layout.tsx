import "@/shared/lib/env";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/shared/components/providers/providers";

export const metadata: Metadata = {
  title: {
    default: "SaaS Starter — Auth, Billing, and Plan Gating Built In",
    template: "%s | SaaS Starter",
  },
  description:
    "The Next.js SaaS starter where billing actually controls your product. Auth, Stripe, enforced plan gating, teams, and a polished dashboard. Buy once, own the code.",
  openGraph: {
    type: "website",
    siteName: "SaaS Starter",
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"} suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
