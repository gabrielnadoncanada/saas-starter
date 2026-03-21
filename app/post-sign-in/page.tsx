import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { completePostSignIn } from '@/features/auth/server/complete-post-sign-in';
import { resumeCheckoutAfterSignIn } from '@/features/billing/server/resume-checkout-after-sign-in';
import { routes } from '@/shared/constants/routes';
import { getCallbackURL } from '@/shared/lib/auth/callback-url';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';

type PostSignInPageProps = {
  searchParams: Promise<{
    redirect?: string;
    priceId?: string;
    callbackUrl?: string;
  }>;
};

export default async function PostSignInPage({ searchParams }: PostSignInPageProps) {
  const [user, { redirect: authRedirect, priceId, callbackUrl: rawCallbackUrl }] =
    await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect(routes.auth.login);
  }

  const currentUser = user as NonNullable<typeof user>;
  const callbackUrl = getCallbackURL(rawCallbackUrl);

  const organizationId = await completePostSignIn({
    email: currentUser.email,
  });

  if (authRedirect === 'checkout' && priceId) {
    const url = await resumeCheckoutAfterSignIn({
      organizationId,
      priceId,
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

