import { redirect } from 'next/navigation';

import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';
import { createCheckoutSession } from '@/features/billing/server/create-checkout-session';
import {
  CheckoutInProgressError,
  clearCheckoutReservation,
  reserveCheckoutForTeam,
} from '@/features/billing/server/checkout-lock';
import { getStripePrices } from '@/features/billing/server/stripe-catalog';
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

    // Validate that the priceId is in the Stripe catalog (prevent arbitrary price injection)
    const allowedPrices = await getStripePrices();
    const isAllowedPrice = allowedPrices.some((p) => p.id === priceId);

    if (!isAllowedPrice) {
      redirect(routes.app.dashboard);
    }

    try {
      // Use checkout lock to prevent double checkouts
      await reserveCheckoutForTeam(team.id, priceId);

      try {
        const url = await createCheckoutSession({
          priceId,
          teamId: team.id,
          seatQuantity: team._count.teamMembers,
          stripeCustomerId: team.stripeCustomerId,
          userEmail: user.email,
        });

        redirect(url);
      } catch (error) {
        await clearCheckoutReservation(team.id);
        throw error;
      }
    } catch (error) {
      if (error instanceof CheckoutInProgressError) {
        redirect(routes.app.settingsTeam);
      }
      throw error;
    }
  }

  redirect(routes.app.dashboard);
}
