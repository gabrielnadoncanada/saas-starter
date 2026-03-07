import Link from 'next/link';

import { EmailVerificationResendForm } from '@/features/auth/components/EmailVerificationResendForm';
import { consumeEmailVerificationToken } from '@/features/auth/lib/email-verification';

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    priceId?: string;
    redirect?: string;
    sent?: string;
    token?: string;
  }>;
};

function buildSignInHref(redirect?: string, priceId?: string) {
  const params = new URLSearchParams();

  if (redirect === 'checkout') {
    params.set('redirect', redirect);
  }

  if (priceId) {
    params.set('priceId', priceId);
  }

  const query = params.toString();
  return query ? `/sign-in?${query}` : '/sign-in';
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email, priceId, redirect, sent, token } = await searchParams;
  const signInHref = buildSignInHref(redirect, priceId);

  if (token) {
    const verifiedUser = await consumeEmailVerificationToken(token);

    if (!verifiedUser) {
      return (
        <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-md flex-col justify-center">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">Verification link expired</h1>
              <p className="mt-3 text-sm text-gray-600">
                This verification link is invalid or has already expired.
              </p>
              <Link
                href={email ? `/verify-email?email=${encodeURIComponent(email)}` : '/sign-in'}
                className="mt-6 inline-flex text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                {email ? 'Request a new link' : 'Go to sign in'}
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Email verified</h1>
            <p className="mt-3 text-sm text-gray-600">
              Your email address has been confirmed. You can now sign in.
            </p>
            <Link
              href={signInHref}
              className="mt-6 inline-flex rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Continue to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-3 text-sm text-gray-600">
            {email
              ? `We sent a verification link to ${email}.`
              : 'We need you to confirm your email address before you can sign in.'}
          </p>
          {sent === '0' ? (
            <p className="mt-3 text-sm text-amber-600">
              We could not confirm delivery for the first email. Request a new link below.
            </p>
          ) : null}
          {email ? (
            <EmailVerificationResendForm
              email={email}
              redirect={redirect}
              priceId={priceId}
            />
          ) : null}
          <Link
            href={signInHref}
            className="mt-6 inline-flex text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
