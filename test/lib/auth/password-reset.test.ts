import test from 'node:test';
import assert from 'node:assert/strict';

import { createRequestPasswordResetHandler } from '@/features/auth/lib/password-reset';

test('requestPasswordResetForEmail does not send when account does not exist', async () => {
  let sendCalled = false;
  const handler = createRequestPasswordResetHandler({
    createPasswordResetToken: async () => null,
    sendPasswordResetEmail: async () => {
      sendCalled = true;
    }
  });

  const result = await handler('missing@example.com');

  assert.equal(sendCalled, false);
  assert.deepEqual(result, {
    success: 'If an account exists for this email, a password reset link has been sent.',
    email: ''
  });
});

test('requestPasswordResetForEmail sends reset email when token exists', async () => {
  const calls: Array<{ email: string; resetUrl: string }> = [];
  const handler = createRequestPasswordResetHandler({
    createPasswordResetToken: async () => ({
      email: 'user@example.com',
      token: 'token',
      expiresAt: new Date(),
      resetUrl: 'https://app.example.com/reset-password?token=token'
    }),
    sendPasswordResetEmail: async (email, resetUrl) => {
      calls.push({ email, resetUrl });
    }
  });

  await handler('user@example.com');

  assert.deepEqual(calls, [
    {
      email: 'user@example.com',
      resetUrl: 'https://app.example.com/reset-password?token=token'
    }
  ]);
});

test('requestPasswordResetForEmail hides delivery failures from the caller', async () => {
  const errors: unknown[] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args);
  };

  try {
    const handler = createRequestPasswordResetHandler({
      createPasswordResetToken: async () => ({
        email: 'user@example.com',
        token: 'token',
        expiresAt: new Date(),
        resetUrl: 'https://app.example.com/reset-password?token=token'
      }),
      sendPasswordResetEmail: async () => {
        throw new Error('resend unavailable');
      }
    });

    const result = await handler('user@example.com');

    assert.deepEqual(result, {
      success: 'If an account exists for this email, a password reset link has been sent.',
      email: ''
    });
    assert.equal(errors.length, 1);
  } finally {
    console.error = originalConsoleError;
  }
});
