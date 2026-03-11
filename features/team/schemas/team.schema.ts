import { z } from 'zod';

export const removeTeamMemberSchema = z.object({
  memberId: z.coerce.number()
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['MEMBER', 'OWNER'])
});

export const invitationIdSchema = z.object({
  invitationId: z.coerce.number()
});
