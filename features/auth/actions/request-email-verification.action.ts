'use server';

import { validatedAction } from '@/lib/auth/middleware';
import { requestEmailVerificationForEmail } from '@/features/auth/lib/email-verification';
import { requestEmailVerificationSchema } from '@/features/auth/schemas/auth.schema';

export const requestEmailVerificationAction = validatedAction(
  requestEmailVerificationSchema,
  async ({ email, redirect, priceId }) =>
    requestEmailVerificationForEmail(email, {
      redirect,
      priceId
    })
);
