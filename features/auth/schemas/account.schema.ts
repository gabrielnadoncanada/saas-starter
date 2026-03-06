import { z } from 'zod';

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const unlinkAuthProviderSchema = z.object({
  provider: z.enum(['google', 'github'])
});
