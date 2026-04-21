import "@/lib/env";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { GeistPixelSquare } from "geist/font/pixel";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  metadataBase: process.env.BASE_URL
    ? new URL(process.env.BASE_URL)
    : undefined,
  title: {
    default: "SaaS Starter — Your Tagline Here",
    template: "%s | SaaS Starter",
  },
  description:
    "A production-ready Next.js SaaS starter with auth, Stripe billing, multi-tenant organizations, and an AI assistant wired together in a codebase built to be read.",
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
        <Analytics />
      </body>
    </html>
  );
}
