import "@/shared/lib/env";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Geist, Geist_Mono } from "next/font/google";
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

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${GeistPixelSquare.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
