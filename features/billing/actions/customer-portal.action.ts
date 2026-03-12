'use server';

import { redirect } from 'next/navigation';

import { routes } from '@/constants/routes';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCurrentTeam } from '@/features/teams/server/current-team';
import { createCustomerPortalSession } from '@/features/billing/server/customer-portal';

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.auth.login);

  const team = await getCurrentTeam();
  if (!team?.stripeCustomerId || !team?.stripeProductId) {
    redirect(routes.marketing.pricing);
  }

  const url = await createCustomerPortalSession({
    stripeCustomerId: team.stripeCustomerId,
    stripeProductId: team.stripeProductId
  });

  redirect(url);
}

