import { redirect } from 'next/navigation';

import { SettingsPageHeader } from '@/shared/components/shared/SettingsPageHeader';
import { routes } from '@/shared/constants/routes';
import { GeneralSettingsForm } from '@/features/auth/components/settings/GeneralSettingsForm';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';

export async function GeneralSettingsSection() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <SettingsPageHeader title="General Settings" />
      <GeneralSettingsForm
        initialValues={{
          name: user.name ?? '',
          email: user.email ?? '',
          phoneNumber: user.phoneNumber ?? '',
          image: user.image ?? null
        }}
      />
    </section>
  );
}
