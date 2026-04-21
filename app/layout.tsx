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
    default: "Tenviq SaaS Starter — Real B2B Foundations Without the Heavy Starter Kit",
    template: "%s | Tenviq SaaS Starter",
  },
  description:
    "A production-ready Next.js SaaS starter for technical founders building real B2B or AI SaaS products. Auth, Stripe billing, organizations, admin, and AI are already wired together in a codebase built to be read, not decoded.",
  openGraph: {
    type: "website",
    siteName: "Tenviq SaaS Starter",
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
