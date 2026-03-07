import test from 'node:test';
import assert from 'node:assert/strict';

import { createRequestEmailVerificationHandler } from '@/features/auth/lib/email-verification';

test('requestEmailVerificationForEmail does not send when account does not exist', async () => {
  let sendCalled = false;
  const handler = createRequestEmailVerificationHandler({
    createEmailVerificationToken: async () => null,
    sendEmailVerificationEmail: async () => {
      sendCalled = true;
    }
  });

  const result = await handler('missing@example.com');

  assert.equal(sendCalled, false);
  assert.deepEqual(result, {
    success: 'If an account exists for this email, a verification link has been sent.',
    email: ''
  });
});

test('requestEmailVerificationForEmail sends email when token exists', async () => {
  const calls: Array<{ email: string; verificationUrl: string }> = [];
  const handler = createRequestEmailVerificationHandler({
    createEmailVerificationToken: async () => ({
      email: 'user@example.com',
      token: 'token',
      expiresAt: new Date(),
      verificationUrl: 'https://app.example.com/verify-email?token=token'
    }),
    sendEmailVerificationEmail: async (email, verificationUrl) => {
      calls.push({ email, verificationUrl });
    }
  });

  await handler('user@example.com');

  assert.deepEqual(calls, [
    {
      email: 'user@example.com',
      verificationUrl: 'https://app.example.com/verify-email?token=token'
    }
  ]);
});

test('requestEmailVerificationForEmail hides delivery failures from the caller', async () => {
  const errors: unknown[] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args);
  };

  try {
    const handler = createRequestEmailVerificationHandler({
      createEmailVerificationToken: async () => ({
        email: 'user@example.com',
        token: 'token',
        expiresAt: new Date(),
        verificationUrl: 'https://app.example.com/verify-email?token=token'
      }),
      sendEmailVerificationEmail: async () => {
        throw new Error('resend unavailable');
      }
    });

    const result = await handler('user@example.com');

    assert.deepEqual(result, {
      success: 'If an account exists for this email, a verification link has been sent.',
      email: ''
    });
    assert.equal(errors.length, 1);
  } finally {
    console.error = originalConsoleError;
  }
});
