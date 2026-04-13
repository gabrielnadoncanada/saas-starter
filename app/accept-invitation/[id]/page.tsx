import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { OrganizationInvitationPage } from "@/features/organizations/components/organization-invitation-page";
import { buildCallbackURL } from "@/lib/auth/callback-url";
import { getCurrentUser } from "@/lib/auth/get-current-user";

type AcceptInvitationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          callbackUrl: `/accept-invitation/${id}`,
        }),
      ),
    );
  }

  return <OrganizationInvitationPage invitationId={id} />;
}
