import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEmailVerificationEmail } from '@/lib/email/templates';

test('buildEmailVerificationEmail creates html, text, and tags', () => {
  const payload = buildEmailVerificationEmail({
    email: 'user@example.com',
    verificationUrl: 'https://app.example.com/verify-email?token=abc123'
  });

  assert.deepEqual(payload.to, ['user@example.com']);
  assert.equal(payload.subject, 'Verify your email address');
  assert.match(payload.text, /verify your email/i);
  assert.match(payload.text, /abc123/);
  assert.match(
    payload.html,
    /<a href="https:\/\/app\.example\.com\/verify-email\?token=abc123">/
  );
  assert.deepEqual(payload.tags, [{ name: 'email_type', value: 'email_verification' }]);
});
