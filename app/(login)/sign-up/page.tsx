import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getEnabledOAuthProviderIds } from '@/lib/auth/providers';

export default function SignUpPage() {
  const oauthProviders = getEnabledOAuthProviderIds();

  return (
    <Suspense>
      <LoginForm mode="signup" oauthProviders={oauthProviders} />
    </Suspense>
  );
}
