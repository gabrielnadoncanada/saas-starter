import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/shared/lib/auth/providers';

export default function SignInPage() {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();

  return (
    <Suspense>
      <AuthForm
        mode="signin"
        oauthProviders={oauthProviders}
        allowMagicLink={allowMagicLink}
      />
    </Suspense>
  );
}
