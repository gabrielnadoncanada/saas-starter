import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTeamInvitationEmail } from '@/lib/email/templates';

test('buildTeamInvitationEmail includes invitation context and signup link', () => {
  process.env.BASE_URL = 'https://app.example.com';

  const payload = buildTeamInvitationEmail({
    email: 'invitee@example.com',
    role: 'owner',
    inviterName: 'Jane Doe',
    teamName: 'Platform Team',
    invitationId: 42
  });

  assert.deepEqual(payload.to, ['invitee@example.com']);
  assert.equal(payload.subject, "You're invited to join Platform Team");
  assert.match(payload.text, /Jane Doe invited you to join Platform Team as owner\./);
  assert.match(payload.text, /https:\/\/app\.example\.com\/sign-up\?inviteId=42/);
  assert.match(payload.html, /Accept the invitation/);
  assert.deepEqual(payload.tags, [{ name: 'email_type', value: 'team_invitation' }]);
});
