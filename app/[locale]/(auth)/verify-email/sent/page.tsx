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

type VerifyEmailSentPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProps) {
  const { callbackUrl } = await searchParams;
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);
  const t = await getTranslations("auth");

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">{t("verifyEmailSent.title")}</CardTitle>
        <CardDescription>{t("verifyEmailSent.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t("verifyEmailSent.afterVerificationLead")}{" "}
          <Link href={signInHref} className="underline underline-offset-4">
            {t("verifyEmailSent.returnToSignIn")}
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
