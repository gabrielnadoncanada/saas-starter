import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email().min(3).max(255)
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
