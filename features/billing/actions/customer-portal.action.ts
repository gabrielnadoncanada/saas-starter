'use server';

import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/features/auth/server/current-user';
import { getCurrentTeam } from '@/features/team/lib/current-team';
import { createCustomerPortalSession } from '@/features/billing/server/customer-portal';

export async function customerPortalAction() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const team = await getCurrentTeam();
  if (!team?.stripeCustomerId || !team?.stripeProductId) {
    redirect('/pricing');
  }

  const url = await createCustomerPortalSession({
    stripeCustomerId: team.stripeCustomerId,
    stripeProductId: team.stripeProductId
  });

  redirect(url);
}
