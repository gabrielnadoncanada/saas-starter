import { redirect } from "next/navigation";

import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
} from "@/shared/components/layout/page";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import type {
  LinkedProviderOverview,
  SecuritySettingsFeedback,
} from "@/features/account/types/account.types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/shared/components/ui/card";
import { KeyRound, Link2, Pencil, Trash, UserIcon } from "lucide-react";
import { LinkedAccountsCard } from "@/features/account/components/settings/linked-accounts-card";
import { getLinkedAccountsOverview } from "@/features/account/server/linked-accounts";
import {
  OAUTH_PROVIDER_LABELS,
  getEnabledOAuthProviderIds,
  isOAuthProviderId,
} from "@/shared/lib/auth/oauth-config";
import { EditProfileDialog } from "@/features/account/components/settings/edit-profile-dialog";
import { Button } from "@/shared/components/ui/button";
import { EditPasswordDialog } from "@/features/account/components/settings/edit-password-dialog";
import { DeleteAccountDialog } from "@/features/account/components/settings/delete-account-dialog";
type PageProps = {
  searchParams: Promise<{
    success?: string;
    provider?: string;
    error?: string;
  }>;
};
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Unable to link this provider. Try a different sign-in method.",
  OAuthSignin: "Unable to start provider linking. Please try again.",
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  const { success, provider, error } = await searchParams;
  const oauthProviders = getEnabledOAuthProviderIds();
  const linkedAccounts = await getLinkedAccountsOverview(oauthProviders);

  const providerLabel =
    provider && isOAuthProviderId(provider)
      ? OAUTH_PROVIDER_LABELS[provider]
      : "Provider";
  const feedback: SecuritySettingsFeedback = {
    error: error
      ? (OAUTH_ERROR_MESSAGES[error] ?? "Unable to link this provider.")
      : undefined,
    success:
      success === "linked"
        ? `${providerLabel} linked successfully.`
        : success === "unlinked"
          ? `${providerLabel} unlinked successfully.`
          : undefined,
  };

  if (!user) {
    redirect(routes.auth.login);
  }

  function mapLinkedProviders(
    providers: Array<{
      provider: LinkedProviderOverview["provider"];
      linkedAt: Date | null;
      isLinked: boolean;
      canUnlink: boolean;
    }>,
  ): LinkedProviderOverview[] {
    return providers.map((provider) => ({
      provider: provider.provider,
      linkedAt: provider.linkedAt?.toISOString() ?? null,
      isLinked: provider.isLinked,
      canUnlink: provider.canUnlink,
    }));
  }

  return (
    <Page fixed>
      <PageHeader>
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

            <EditProfileDialog
              name={user.name}
              phoneNumber={user.phoneNumber ?? ""}
            >
              <Button variant="outline" size="sm" className="ml-auto">
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </EditProfileDialog>
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
            providers={mapLinkedProviders(linkedAccounts.providers)}
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
            <EditPasswordDialog hasPassword={linkedAccounts.hasPassword}>
              <Button variant="outline" size="sm">
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                Change Password
              </Button>
            </EditPasswordDialog>
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
            <DeleteAccountDialog>
              <Button variant="destructive" size="sm">
                <KeyRound className="mr-2 h-3.5 w-3.5" />
                Delete Account
              </Button>
            </DeleteAccountDialog>
          </CardAction>
        </CardHeader>
      </Card>
    </Page>
  );
}
