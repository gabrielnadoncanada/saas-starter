import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/shared/components/app/ThemeProvider';
import { Toaster } from '@/shared/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, Prisma, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.className}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
