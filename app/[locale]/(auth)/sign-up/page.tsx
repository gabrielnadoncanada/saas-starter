import { SignUpForm } from "@/features/auth/components/sign-up/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import {
  buildCallbackURL,
  getCallbackURL,
} from "@/shared/lib/auth/callback-url";
import {
  getEnabledOAuthProviderIds,
  hasMagicLinkProvider,
} from "@/shared/lib/auth/oauth-config";
import { Link } from "@/shared/i18n/navigation";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("auth");
  const tc = await getTranslations("common");

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">{t("signup.title")}</CardTitle>
        <CardDescription>
          {t("signup.hasAccount")}{" "}
          <Link
            href={signInHref}
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signup.signinLink")}
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
          {t("signup.termsAgreement")}{" "}
          <Link
            href={routes.marketing.terms}
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signup.termsLink")}
          </Link>{" "}
          {tc("and")}{" "}
          <Link
            href={routes.marketing.privacy}
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signup.privacyLink")}
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
