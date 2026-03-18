import Link from 'next/link';
import { Suspense } from 'react';

import { AuthCard } from '@/features/auth/components/AuthCard';
import { ResendMagicLinkButton } from '@/features/auth/components/ResendMagicLinkButton';
import { getAuthFlowParams } from '@/features/auth/utils/auth-flow';
import { routes } from '@/shared/constants/routes';

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    redirect?: string;
    priceId?: string;
    inviteId?: string;
  }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const rawSearchParams = await searchParams;
  const email = rawSearchParams.email?.trim() || null;
  const { redirect, priceId, pricingModel, inviteId } = getAuthFlowParams(rawSearchParams);

  return (
    <Suspense>
      <AuthCard
        title="Check your email"
        contentClassName="space-y-3"
        description="We sent a magic sign-in link to your email address."
      >
        <p className="text-sm text-muted-foreground">
          Open the email and click the link to complete sign-in.
        </p>
        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              Haven&apos;t received it?{' '}
              <ResendMagicLinkButton
                email={email}
                redirect={redirect}
                priceId={priceId}
                pricingModel={pricingModel}
                inviteId={inviteId}
              />
            </>
          ) : (
            <>
              Missing the email address?{' '}
              <Link
                href={routes.auth.login}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Go back to sign in
              </Link>
            </>
          )}
        </p>
      </AuthCard>
    </Suspense>
  );
}
