import { redirect } from "next/navigation";
import { OrganizationInvitationPage } from "@/features/teams/invitations/components/organization-invitation-page";
import { routes } from "@/shared/constants/routes";
import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

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
