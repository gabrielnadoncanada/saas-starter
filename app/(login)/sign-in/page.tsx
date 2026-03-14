import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login/LoginForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/shared/lib/auth/providers';

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
