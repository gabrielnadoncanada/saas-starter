import { headers } from "next/headers";

import { ensureUserWorkspace } from "@/features/auth/server/onboarding";
import { isBillingInterval, isPlanId } from "@/features/billing/catalog/resolver";
import { resumeCheckoutAfterSignIn } from "@/features/billing/server/resume-checkout-after-sign-in";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { getCallbackURL } from "@/shared/lib/auth/callback-url";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

type PostSignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    billingInterval?: string;
    redirect?: string;
    planId?: string;
    callbackUrl?: string;
  }>;
};

export default async function PostSignInPage({
  params,
  searchParams,
}: PostSignInPageProps) {
  const [
    { locale },
    user,
    {
      redirect: authRedirect,
      planId,
      billingInterval,
      callbackUrl: rawCallbackUrl,
    },
  ] = await Promise.all([params, getCurrentUser(), searchParams]);

  if (!user) {
    redirectToLocale(locale, routes.auth.login);
  }

  const callbackUrl = getCallbackURL(rawCallbackUrl);
  // This page does more than "finish auth":
  // 1. it guarantees every new user gets a workspace,
  // 2. it resumes a pending Stripe checkout when sign-in started from pricing,
  // 3. it only falls back to the app/dashboard redirect after those critical steps.
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
      redirectToLocale(locale, routes.app.dashboard);
    }

    redirectToLocale(locale, url);
  }

  if (callbackUrl !== routes.auth.postSignIn) {
    redirectToLocale(locale, callbackUrl);
  }

  redirectToLocale(locale, routes.app.dashboard);
}

