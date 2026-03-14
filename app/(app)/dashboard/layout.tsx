'use client';

import { ThemeSwitch } from '@/shared/components/layout/preferences/ThemeSwitch';
import { AuthenticatedLayout } from '@/shared/components/layout/shell/AuthenticatedLayout';
import { Header } from '@/shared/components/layout/shell/Header';
import { Search } from '@/shared/components/layout/navigation/Search';
import { ProfileDropdown } from '@/shared/components/layout/user/ProfileDropdown';
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
