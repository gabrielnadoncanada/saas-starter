import Link from 'next/link';

import type { AuthMode } from '@/features/auth/types/auth.types';

type AuthModeLinkProps = {
  mode: AuthMode;
  href: string;
};

export function AuthModeLink({ mode, href }: AuthModeLinkProps) {
  return (
    <Link
      href={href}
      className="flex w-full justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
    >
      {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
    </Link>
  );
}