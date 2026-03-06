'use client';

import { SettingsPageHeader } from '@/components/shared/SettingsPageHeader';
import { DeleteAccountCard } from '@/features/auth/components/DeleteAccountCard';
import {
  LinkedAccountsCard,
  type LinkedProvider
} from '@/features/auth/components/LinkedAccountsCard';
import { PasswordSettingsCard } from '@/features/auth/components/PasswordSettingsCard';

type SecuritySettingsClientProps = {
  hasPassword: boolean;
  providers: LinkedProvider[];
  feedback?: {
    error?: string;
    success?: string;
  };
};

export function SecuritySettingsClient(props: SecuritySettingsClientProps) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="Security Settings" />
      <PasswordSettingsCard />
      <LinkedAccountsCard {...props} />
      <DeleteAccountCard />
    </section>
  );
}
