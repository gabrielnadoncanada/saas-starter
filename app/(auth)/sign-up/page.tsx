import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { PasswordSignUpForm } from '@/features/auth/components/PasswordSignUpForm';
import { getEnabledOAuthProviderIds, hasMagicLinkProvider } from '@/shared/lib/auth/providers';
import { AuthCard } from '@/features/auth/components/AuthCard';
import Link from 'next/link';
import { routes } from '@/shared/constants/routes';
import { Separator } from '@/shared/components/ui/separator';
import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const hasProviderChoice = allowMagicLink || oauthProviders.length > 0;
  const authFlow = getAuthFlowParams(await searchParams);

  return (
    <Suspense>
      <AuthCard
        title="Create an account"
        contentClassName="space-y-3"
        description={(
          <>
            {hasProviderChoice
              ? 'Create your account with a password, an email link, or a connected provider.'
              : 'Create your account with a password.'}

            &nbsp;Already have an account?{" "}
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
        <div className="space-y-6">
          <PasswordSignUpForm {...authFlow} />
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
