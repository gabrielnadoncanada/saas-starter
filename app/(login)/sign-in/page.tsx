import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/lib/auth/providers';

export default function SignInPage() {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();

  return (
    <Suspense>
      <LoginForm
        mode="signin"
        oauthProviders={oauthProviders}
        allowMagicLink={allowMagicLink}
      />
    </Suspense>
  );
}
