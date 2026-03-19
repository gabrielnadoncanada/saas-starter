import { Suspense } from 'react';
import { SignUpMethods } from '@/features/auth/components/SignUpMethods';
import { getEnabledOAuthProviderIds } from '@/shared/lib/auth/oauth-config';
import { hasMagicLinkProvider } from '@/shared/lib/auth/providers';
import { AuthCard } from '@/features/auth/components/AuthCard';
import Link from 'next/link';
import { routes } from '@/shared/constants/routes';
import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const authFlow = getAuthFlowParams(await searchParams);

  return (
    <Suspense>
      <AuthCard
        title="Create an account"
        contentClassName="space-y-3"
        description={(
          <>
            <span className="whitespace-nowrap">Already have an account?{" "}
              <Link href={routes.auth.login} className="underline underline-offset-4 hover:text-primary">
                Sign In
              </Link>
            </span>
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
        <SignUpMethods
          {...authFlow}
          oauthProviders={oauthProviders}
          allowMagicLink={allowMagicLink}
        />
      </AuthCard>
    </Suspense>
  );
}
