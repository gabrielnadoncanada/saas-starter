import "@/lib/env";
import "./globals.css";

import { GeistPixelSquare } from "geist/font/pixel";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  metadataBase: process.env.BASE_URL
    ? new URL(process.env.BASE_URL)
    : undefined,
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
  twitter: {
    card: "summary_large_image",
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

const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} ${GeistPixelSquare.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
