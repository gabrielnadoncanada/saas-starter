import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getEnabledOAuthProviderIds } from '@/lib/auth/providers';

export default function SignInPage() {
  const oauthProviders = getEnabledOAuthProviderIds();

  return (
    <Suspense>
      <LoginForm mode="signin" oauthProviders={oauthProviders} />
    </Suspense>
  );
}
