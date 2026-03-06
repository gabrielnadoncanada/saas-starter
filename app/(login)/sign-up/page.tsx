import { Suspense } from 'react';
import { Login } from '../login';
import { getEnabledOAuthProviderIds } from '@/lib/auth/providers';

export default function SignUpPage() {
  const oauthProviders = getEnabledOAuthProviderIds();

  return (
    <Suspense>
      <Login mode="signup" oauthProviders={oauthProviders} />
    </Suspense>
  );
}
