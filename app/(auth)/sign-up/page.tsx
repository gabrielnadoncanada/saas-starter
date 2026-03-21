import Link from "next/link";
import { SignUpForm } from "@/features/auth/components/sign-up/sign-up-form";
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
} from "@/shared/lib/auth/oauth-config";
import {
  buildCallbackURL,
  getCallbackURL,
} from "@/shared/lib/auth/callback-url";
import { routes } from "@/shared/constants/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type SignUpPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { callbackUrl: callbackUrlParam } = await searchParams;
  const callbackUrl = getCallbackURL(callbackUrlParam);
  const oauthProviders = getEnabledOAuthProviderIds();
  const allowMagicLink = hasMagicLinkProvider();
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Already have an account?{" "}
          <Link
            href={signInHref}
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <SignUpForm
          callbackUrl={callbackUrl}
          oauthProviders={oauthProviders}
          allowMagicLink={allowMagicLink}
        />
      </CardContent>

      <CardFooter>
        <p className="w-full text-center text-sm text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
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
