import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureUserWorkspace } from "@/features/auth/server/onboarding";
import { isBillingInterval, isPlanId } from "@/features/billing/plans";
import { resumeCheckoutAfterSignIn } from "@/features/billing/server/resume-checkout-after-sign-in";
import { routes } from "@/shared/constants/routes";
import { getCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

type PostSignInPageProps = {
  searchParams: Promise<{
    billingInterval?: string;
    redirect?: string;
    planId?: string;
    callbackUrl?: string;
  }>;
};

export default async function PostSignInPage({
  searchParams,
}: PostSignInPageProps) {
  const [
    user,
    {
      redirect: authRedirect,
      planId,
      billingInterval,
      callbackUrl: rawCallbackUrl,
    },
  ] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect(routes.auth.login);
  }

  const callbackUrl = getCallbackURL(rawCallbackUrl);
  const organizationId = await ensureUserWorkspace(user.email);

  if (
    authRedirect === "checkout" &&
    planId &&
    billingInterval &&
    isPlanId(planId) &&
    planId !== "free" &&
    isBillingInterval(billingInterval)
  ) {
    const url = await resumeCheckoutAfterSignIn({
      billingInterval,
      organizationId,
      planId,
      reqHeaders: await headers(),
    });

    if (!url) {
      redirect(routes.app.dashboard);
    }

    redirect(url);
  }

  if (callbackUrl !== routes.auth.postSignIn) {
    redirect(callbackUrl);
  }

  redirect(routes.app.dashboard);
}
