import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPasswordResetEmail } from '@/lib/email/templates';

test('buildPasswordResetEmail creates html, text, and tags', () => {
  const payload = buildPasswordResetEmail({
    email: 'user@example.com',
    resetUrl: 'https://app.example.com/reset-password?token=abc123'
  });

  assert.deepEqual(payload.to, ['user@example.com']);
  assert.equal(payload.subject, 'Reset your password');
  assert.match(payload.text, /reset your password/i);
  assert.match(payload.text, /abc123/);
  assert.match(payload.html, /<a href="https:\/\/app\.example\.com\/reset-password\?token=abc123">/);
  assert.deepEqual(payload.tags, [{ name: 'email_type', value: 'password_reset' }]);
});
