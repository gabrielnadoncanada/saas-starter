import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/shared/lib/auth/providers';
import { AuthCard } from '@/features/auth/components/AuthCard';
import Link from 'next/link';
import { routes } from '@/shared/constants/routes';

export default function SignUpPage() {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const hasProviderChoice = allowMagicLink || oauthProviders.length > 0;

  return (
    <Suspense>
      <AuthCard
        title="Create an account"
        contentClassName="space-y-3"
        description={(
          <>
            {hasProviderChoice
              ? 'Use your email link or a connected provider to create your account.'
              : 'No sign-up method is currently configured.'}
            <br />
            Already have an account?{" "}
            <Link href={routes.auth.login} className="underline underline-offset-4 hover:text-primary">
              Sign In
            </Link>
          </>
        )}
        footer={(
          <p className="px-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        )}
      >
        <AuthForm
          oauthProviders={oauthProviders}
          allowMagicLink={allowMagicLink}
        />
      </AuthCard>
    </Suspense>
  );
}
