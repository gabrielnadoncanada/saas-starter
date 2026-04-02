import { buildPostSignInCallbackURL } from "@/features/auth/utils/post-sign-in";
import { OrganizationInvitationPage } from "@/features/organizations/components/organization-invitation-page";
import { routes } from "@/shared/constants/routes";
import { getLocalizedHref, redirectToLocale } from "@/shared/i18n/href";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

type AcceptInvitationPageProps = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

export default async function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const { id, locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirectToLocale(
      locale,
      buildCallbackURL(
        routes.auth.login,
        buildPostSignInCallbackURL({
          callbackUrl: getLocalizedHref(locale, `/accept-invitation/${id}`),
        }),
      ),
    );
  }

  return <OrganizationInvitationPage invitationId={id} />;
}

