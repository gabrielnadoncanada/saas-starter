import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { ensureUserOrganization } from "@/features/auth/server/onboarding";
import {
  isBillingInterval,
  isPlanId,
} from "@/features/billing/plans";
import { resumeCheckoutAfterSignIn } from "@/features/billing/server/resume-checkout-after-sign-in";
import { getCallbackURL } from "@/lib/auth/callback-url";
import { getCurrentUser } from "@/lib/auth/get-current-user";

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
  // This page does more than "finish auth":
  // 1. it guarantees every new user gets an organization,
  // 2. it resumes a pending Stripe checkout when sign-in started from pricing,
  // 3. it only falls back to the app/dashboard redirect after those critical steps.
  const organizationId = await ensureUserOrganization(user.email);

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
