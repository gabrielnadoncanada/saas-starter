import { redirect } from 'next/navigation';

import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';
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

  const { inviteId, redirect: authRedirect, priceId } =
    getAuthFlowParams(rawSearchParams);

  const teamId = await completePostSignIn({
    userId: user.id,
    email: user.email,
    inviteId
  });

  if (authRedirect === 'checkout' && priceId) {
    const [team, membership] = await Promise.all([
      db.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          stripeCustomerId: true,
          _count: {
            select: {
              teamMembers: true,
            },
          },
        },
      }),
      db.teamMember.findFirst({
        where: {
          teamId,
          userId: user.id,
        },
        select: {
          role: true,
        },
      }),
    ]);

    if (!team) {
      throw new Error('Team not found after sign-in provisioning.');
    }

    if (membership?.role !== 'OWNER') {
      redirect(routes.app.dashboard);
    }

    const url = await createCheckoutSession({
      priceId,
      teamId: team.id,
      seatQuantity: team._count.teamMembers,
      stripeCustomerId: team.stripeCustomerId,
      userEmail: user.email,
    });

    redirect(url);
  }

  redirect(routes.app.dashboard);
}
