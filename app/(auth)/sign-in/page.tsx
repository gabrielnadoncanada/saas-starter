import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import {
  buildCallbackURL,
  getCallbackURL,
} from "@/lib/auth/callback-url";
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
} from "@/lib/auth/oauth-config";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl: callbackUrlParam } = await searchParams;
  const callbackUrl = getCallbackURL(callbackUrlParam);
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const signUpHref = buildCallbackURL(routes.auth.signup, callbackUrl);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Sign in</CardTitle>
        <CardDescription>
          Don't have an account?
          <Link
            href={signUpHref}
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <SignInForm
          callbackUrl={callbackUrl}
          oauthProviders={oauthProviders}
          allowMagicLink={allowMagicLink}
        />
      </CardContent>

      <CardFooter>
        <p className="w-full text-center text-sm text-muted-foreground">
          By clicking sign in, you agree to our
          <Link
            href={routes.marketing.terms}
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>
          and
          <Link
            href={routes.marketing.privacy}
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
