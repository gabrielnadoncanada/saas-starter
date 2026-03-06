'use server';

import { validatedAction } from '@/lib/auth/middleware';
import { requestPasswordResetForEmail } from '@/features/auth/lib/password-reset';
import { requestPasswordResetSchema } from '@/features/auth/schemas/auth.schema';

export const requestPasswordResetAction = validatedAction(
  requestPasswordResetSchema,
  async ({ email }) => requestPasswordResetForEmail(email)
);
