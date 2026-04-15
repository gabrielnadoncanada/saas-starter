import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
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
    <AuthShell
      eyebrow="Sign in · Returning"
      title="Welcome back"
      description="Continue where you left off. One click to your workspace."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link
            href={signUpHref}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Create an account
          </Link>
          .
        </p>
      }
    >
      <SignInForm
        callbackUrl={callbackUrl}
        oauthProviders={oauthProviders}
        allowMagicLink={allowMagicLink}
      />
      <p className="mt-6 border-t border-border pt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        By signing in, you agree to our{" "}
        <Link
          href={routes.marketing.terms}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href={routes.marketing.privacy}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}
