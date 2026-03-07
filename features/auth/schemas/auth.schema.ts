import { z } from 'zod';

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const optionalCheckoutRedirect = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.enum(['checkout']).optional());

export const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signUpSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  redirect: optionalCheckoutRedirect,
  priceId: optionalString.pipe(z.string().max(255).optional()),
  inviteId: optionalString
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email().min(3).max(255)
});

export const requestEmailVerificationSchema = z.object({
  email: z.string().email().min(3).max(255),
  redirect: optionalCheckoutRedirect,
  priceId: optionalString.pipe(z.string().max(255).optional())
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Invalid or expired reset link.'),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'New password and confirmation password do not match.',
    path: ['confirmPassword']
  });
