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
