import { getTranslations } from "next-intl/server";

import { SignInForm } from "@/features/auth/components/sign-in/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";
import {
  buildCallbackURL,
  getCallbackURL,
} from "@/shared/lib/auth/callback-url";
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
} from "@/shared/lib/auth/oauth-config";

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
  const t = await getTranslations("auth");
  const tc = await getTranslations("common");

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">{t("signin.title")}</CardTitle>
        <CardDescription>
          {t("signin.noAccount")}{" "}
          <Link
            href={signUpHref}
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signin.signupLink")}
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
          {t("signin.termsAgreement")}{" "}
          <Link
            href={routes.marketing.terms}
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signin.termsLink")}
          </Link>{" "}
          {tc("and")}{" "}
          <Link
            href={routes.marketing.privacy}
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signin.privacyLink")}
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
