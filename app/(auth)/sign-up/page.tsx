import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import {
  buildCallbackURL,
  getCallbackURL,
} from "@/lib/auth/callback-url";
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
} from "@/lib/auth/oauth-config";

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
    <AuthShell
      eyebrow="Sign up · New account"
      title="Start shipping today"
      description="Spin up a workspace — invite teammates, configure billing, go live."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Already signed up?{" "}
          <Link
            href={signInHref}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Sign in instead
          </Link>
          .
        </p>
      }
    >
      <SignUpForm
        callbackUrl={callbackUrl}
        oauthProviders={oauthProviders}
        allowMagicLink={allowMagicLink}
      />
      <p className="mt-6 border-t border-border pt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        By creating an account, you agree to our{" "}
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
