import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/lib/auth/providers';

export default function SignUpPage() {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();

  return (
    <Suspense>
      <LoginForm
        mode="signup"
        oauthProviders={oauthProviders}
        allowMagicLink={allowMagicLink}
      />
    </Suspense>
  );
}
