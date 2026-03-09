import { buildTeamInvitationEmail } from '@/lib/email/templates';

it('buildTeamInvitationEmail includes invitation context and sign-in link', () => {
  process.env.BASE_URL = 'https://app.example.com';

  const payload = buildTeamInvitationEmail({
    email: 'invitee@example.com',
    role: 'owner',
    inviterName: 'Jane Doe',
    teamName: 'Platform Team',
    invitationId: 42
  });

  expect(payload.to).toEqual(['invitee@example.com']);
  expect(payload.subject).toBe("You're invited to join Platform Team");
  expect(payload.text).toMatch(/Jane Doe invited you to join Platform Team as owner\./);
  expect(payload.text).toMatch(/https:\/\/app\.example\.com\/sign-in\?inviteId=42/);
  expect(payload.html).toMatch(/Accept the invitation/);
  expect(payload.tags).toEqual([{ name: 'email_type', value: 'team_invitation' }]);
});
