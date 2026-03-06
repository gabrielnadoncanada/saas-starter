import Link from 'next/link';
import { getValidPasswordResetToken } from '@/lib/auth/password-reset';
import { ResetPasswordForm } from './reset-password-form';

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Invalid reset link</h1>
            <p className="mt-3 text-sm text-gray-600">
              This password reset link is missing a token.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const passwordResetToken = await getValidPasswordResetToken(token);

  if (!passwordResetToken) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Reset link expired</h1>
            <p className="mt-3 text-sm text-gray-600">
              This password reset link is invalid or has already expired.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
