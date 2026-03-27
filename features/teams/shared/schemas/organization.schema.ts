import { z } from 'zod';

export const removeOrganizationMemberSchema = z.object({
  memberId: z.string()
});

export const inviteOrganizationMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'admin'])
});

export const invitationIdSchema = z.object({
  invitationId: z.string()
});

export const renameOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name is too long'),
});
