import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { HeaderUserMenu } from '@/components/shared/HeaderUserMenu';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { CircleIcon } from 'lucide-react';

async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-foreground">ACME</span>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <HeaderUserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
