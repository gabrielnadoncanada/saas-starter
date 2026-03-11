import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { getCurrentUser } from '@/features/auth/server/current-user';
import { getCurrentTeam } from '@/features/team/server/current-team';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, Prisma, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={manrope.className}
    >
      <body className="min-h-[100dvh] bg-background text-foreground antialiased">
        <ThemeProvider>
          <SWRConfig
            value={{
              fallback: {
                // We do NOT await here
                // Only components that read this data will suspend
                '/api/user': getCurrentUser(),
                '/api/team': getCurrentTeam()
              }
            }}
          >
            {children}
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
