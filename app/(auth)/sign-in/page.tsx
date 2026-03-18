import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { PasswordSignInForm } from '@/features/auth/components/PasswordSignInForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/shared/lib/auth/providers';
import { AuthCard } from '@/features/auth/components/AuthCard';
import Link from 'next/link';
import { routes } from '@/shared/constants/routes';
import { Separator } from '@/shared/components/ui/separator';
import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const hasProviderChoice = allowMagicLink || oauthProviders.length > 0;
  const authFlow = getAuthFlowParams(await searchParams);

  return (
    <Suspense>
      <AuthCard
        title="Sign in"
        contentClassName="space-y-3"
        description={(
          <>
            {hasProviderChoice
              ? 'Use your password, an email link, or a connected provider to access your account.'
              : 'Use your password to access your account.'}

            &nbsp;Don&apos;t have an account?{" "}
            <Link
              href={routes.auth.signup}
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </>
        )}
        footer={(
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking sign in, you agree to our{" "}
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
        <div className="space-y-6">
          <PasswordSignInForm {...authFlow} />
          {hasProviderChoice ? (
            <>
              <Separator />
              <AuthForm
                oauthProviders={oauthProviders}
                allowMagicLink={allowMagicLink}
              />
            </>
          ) : null}
        </div>
      </AuthCard>
    </Suspense>
  );
}
