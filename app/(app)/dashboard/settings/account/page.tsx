import { redirect } from 'next/navigation';

import { DeleteAccountCard } from '@/features/account/components/settings/DeleteAccountCard';
import { GeneralSettingsForm } from '@/features/account/components/settings/GeneralSettingsForm';
import { SettingsPageHeader } from '@/shared/components/app/SettingsPageHeader';
import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';

export default async function SettingsPage() {
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
      <DeleteAccountCard />
    </section>
  );
}
