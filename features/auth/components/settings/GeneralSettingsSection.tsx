import { redirect } from 'next/navigation';

import { SettingsPageHeader } from '@/components/shared/SettingsPageHeader';
import { GeneralSettingsForm } from '@/features/auth/components/settings/GeneralSettingsForm';
import { getCurrentUser } from '@/features/auth/server/current-user';

export async function GeneralSettingsSection() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="General Settings" />
      <GeneralSettingsForm
        initialValues={{
          name: user.name ?? '',
          email: user.email ?? '',
          image: user.image ?? null
        }}
      />
    </section>
  );
}