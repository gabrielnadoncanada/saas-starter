import { ResendMagicLinkButton } from "@/features/auth/components/oauth/resend-magic-link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { Link } from "@/shared/i18n/navigation";
import { getTranslations } from "next-intl/server";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    callbackUrl?: string;
  }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email: rawEmail, callbackUrl } = await searchParams;
  const email = rawEmail?.trim() || null;
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);
  const t = await getTranslations("auth");

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">{t("checkEmail.title")}</CardTitle>
        <CardDescription>{t("checkEmail.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("checkEmail.instructions")}</p>

        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              {t("checkEmail.notReceived")}{" "}
              <ResendMagicLinkButton email={email} callbackUrl={callbackUrl} />
            </>
          ) : (
            <>
              {t("checkEmail.missingEmailQuestion")}{" "}
              <Link
                href={signInHref}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                {t("checkEmail.goBackToSignIn")}
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
