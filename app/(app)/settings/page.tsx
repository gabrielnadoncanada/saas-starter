import { KeyRound, Link2, Trash, UserIcon } from "lucide-react";
import { redirect } from "next/navigation";

import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { DeleteAccountDialog } from "@/features/account/components/settings/delete-account-dialog";
import { EditPasswordDialog } from "@/features/account/components/settings/edit-password-dialog";
import { EditProfileDialog } from "@/features/account/components/settings/edit-profile-dialog";
import { LinkedAccountsCard } from "@/features/account/components/settings/linked-accounts-card";
import { getLinkedAccountsOverview } from "@/features/account/server/linked-accounts";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getEnabledOAuthProviderIds,
  isOAuthProviderId,
  OAUTH_PROVIDER_LABELS,
} from "@/lib/auth/oauth-config";

type PageProps = {
  searchParams: Promise<{
    success?: string;
    provider?: string;
    error?: string;
  }>;
};

type SecuritySettingsFeedback = {
  error?: string;
  success?: string;
};

function oauthLinkErrorMessage(error: string) {
  switch (error) {
    case "account_already_linked_to_different_user":
      return "This provider is already linked to another account.";
    case "email_doesn't_match":
      return "Use a provider account with the same email address as this account.";
    case "OAuthAccountNotLinked":
      return "Unable to link this provider. Try a different sign-in method.";
    case "OAuthSignin":
      return "Unable to start provider linking. Please try again.";
    case "unable_to_link_account":
      return "Unable to link this provider. Please try again.";
    default:
      return "Unable to link this provider.";
  }
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const [user, { success, provider, error }] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (!user) {
    redirect(routes.auth.login);
  }

  const oauthProviders = getEnabledOAuthProviderIds();
  const linkedAccounts = await getLinkedAccountsOverview(oauthProviders);

  const providerLabel =
    provider && isOAuthProviderId(provider)
      ? OAUTH_PROVIDER_LABELS[provider]
      : "Provider";

  const feedback: SecuritySettingsFeedback = {
    error: error ? oauthLinkErrorMessage(error) : undefined,
    success:
      success === "linked"
        ? `${providerLabel} linked successfully.`
        : success === "unlinked"
          ? `${providerLabel} unlinked successfully.`
          : undefined,
  };

  return (
    <Page>
      <PageHeader eyebrow="Settings · Account">
        <PageTitle>Account Settings</PageTitle>
        <PageDescription>
          Manage your personal account settings and preferences.
        </PageDescription>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-4" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="justify-center text-lg">
                {(user.name || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <EditProfileDialog image={user.image ?? null} name={user.name} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            Linked Accounts
          </CardTitle>
          <CardDescription>
            Connect your account with external providers for easier sign-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkedAccountsCard
            providers={linkedAccounts.providers}
            feedback={feedback}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Password
          </CardTitle>
          <CardDescription>Change your account password</CardDescription>
          <CardAction>
            <EditPasswordDialog hasPassword={linkedAccounts.hasPassword} />
          </CardAction>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash className="size-4" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Delete your account and all your data
          </CardDescription>
          <CardAction>
            <DeleteAccountDialog />
          </CardAction>
        </CardHeader>
      </Card>
    </Page>
  );
}
