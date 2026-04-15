import { redirect } from "next/navigation";

import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { routes } from "@/constants/routes";
import { TwoFactorSettingsCard } from "@/features/account/components/settings/two-factor-settings-card";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function SecuritySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  return (
    <Page>
      <PageHeader eyebrow="Settings · Security">
        <PageTitle>Security</PageTitle>
        <PageDescription>
          Review the security controls that protect your account.
        </PageDescription>
      </PageHeader>

      <TwoFactorSettingsCard enabled={user.twoFactorEnabled} />
    </Page>
  );
}
