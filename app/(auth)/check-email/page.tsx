import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { ResendMagicLinkButton } from '@/features/auth/components/oauth/ResendMagicLinkButton';
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
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Check your email</CardTitle>
        <CardDescription>
          We sent a magic sign-in link to your email address.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
}
