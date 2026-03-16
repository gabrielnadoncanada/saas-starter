import { CircleIcon } from 'lucide-react';

import type { AuthMode } from '@/features/auth/types/auth.types';

type AuthHeaderProps = {
  mode: AuthMode;
  subtitle: string;
};

export function AuthHeader({ mode, subtitle }: AuthHeaderProps) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center">
        <CircleIcon className="h-12 w-12 text-orange-500" />
      </div>

      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
      </h2>

      <p className="mt-3 text-center text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}