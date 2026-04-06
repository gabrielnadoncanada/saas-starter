import "@/shared/lib/env";
import "@/shared/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-fallback",
  fallback: ["system-ui,Helvetica Neue,Helvetica,Arial"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"} suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
