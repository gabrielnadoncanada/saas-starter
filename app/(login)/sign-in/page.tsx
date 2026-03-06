import { Suspense } from 'react';
import { Login } from '../login';
import { getEnabledOAuthProviderIds } from '@/lib/auth/providers';

export default function SignInPage() {
  const oauthProviders = getEnabledOAuthProviderIds();

  return (
    <Suspense>
      <Login mode="signin" oauthProviders={oauthProviders} />
    </Suspense>
  );
}
