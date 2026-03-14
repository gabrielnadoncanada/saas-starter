import { redirect } from 'next/navigation';

import { createCheckoutSession } from '@/features/billing/server/create-checkout-session';
import { getCurrentUser } from '@/shared/lib/auth/get-current-user';
import { completePostSignIn } from '@/features/auth/server/complete-post-sign-in';
import { db } from '@/shared/lib/db/prisma';

type PostSignInPageProps = {
  searchParams: Promise<{
    inviteId?: string;
    redirect?: string;
    priceId?: string;
  }>;
};

export default async function PostSignInPage({ searchParams }: PostSignInPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect('/sign-in');
  }

  const teamId = await completePostSignIn({
    userId: user.id,
    email: user.email,
    inviteId: params.inviteId
  });

  if (params.redirect === 'checkout' && params.priceId) {
    const team = await db.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      throw new Error('Team not found after sign-in provisioning.');
    }

    const url = await createCheckoutSession({
      priceId: params.priceId,
      stripeCustomerId: team.stripeCustomerId,
      userEmail: user.email,
      userId: user.id
    });

    redirect(url);
  }

  redirect('/dashboard');
}
