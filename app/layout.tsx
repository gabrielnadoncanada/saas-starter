import "@/shared/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { ImpersonationBannerWrapper } from "@/features/admin/components/impersonation-banner-wrapper";
import { ThemeProvider } from "@/shared/components/app/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import { getRequestLocale } from "@/shared/i18n/server-locale";

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
  const locale = await getRequestLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <ImpersonationBannerWrapper />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
