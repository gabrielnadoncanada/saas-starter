import { redirect } from "next/navigation";

import { TwoFactorSettingsCard } from "@/features/account/components/settings/two-factor-settings-card";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export default async function SecuritySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.auth.login);
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>Security</PageTitle>
        <PageDescription>Review the security controls that protect your account.</PageDescription>
      </PageHeader>

      <TwoFactorSettingsCard enabled={user.twoFactorEnabled} />
    </Page>
  );
}
