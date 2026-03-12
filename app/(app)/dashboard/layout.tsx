'use client';

import { ThemeSwitch } from '@/components/layout/preferences/ThemeSwitch';
import { AuthenticatedLayout } from '@/components/layout/shell/AuthenticatedLayout';
import { Header } from '@/components/layout/shell/Header';
import { Search } from '@/components/layout/navigation/Search';
import { ProfileDropdown } from '@/components/layout/user/ProfileDropdown';
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      {children}
    </AuthenticatedLayout>
  );
}
