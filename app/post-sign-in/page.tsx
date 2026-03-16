import { redirect } from 'next/navigation';

import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';
import type { PricingModel } from '@/features/billing/plans';
import { createCheckoutSession } from '@/features/billing/server/create-checkout-session';
import { routes } from '@/shared/constants/routes';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import { completePostSignIn } from '@/features/auth/server/complete-post-sign-in';
import { db } from '@/shared/lib/db/prisma';

type PostSignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PostSignInPage({ searchParams }: PostSignInPageProps) {
  const [user, rawSearchParams] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect(routes.auth.login);
  }

  const { inviteId, redirect: authRedirect, priceId, pricingModel } =
    getAuthFlowParams(rawSearchParams);

  const teamId = await completePostSignIn({
    userId: user.id,
    email: user.email,
    inviteId
  });

  if (authRedirect === 'checkout' && priceId) {
    const team = await db.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      throw new Error('Team not found after sign-in provisioning.');
    }

    const url = await createCheckoutSession({
      priceId,
      stripeCustomerId: team.stripeCustomerId,
      userEmail: user.email,
      userId: user.id,
      pricingModel: (pricingModel as PricingModel) || "flat",
    });

    redirect(url);
  }

  redirect(routes.app.dashboard);
}
