'use server';

import { redirect } from 'next/navigation';

import { createCustomerPortalSession } from '@/features/billing/lib/stripe-billing';
import { withTeam } from '@/lib/auth/middleware';

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
