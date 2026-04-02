import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";
import { getTranslations } from "next-intl/server";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { error } = await searchParams;
  const t = await getTranslations("auth");

  if (error) {
    return (
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">
            {t("verifyEmail.failedTitle")}
          </CardTitle>
          <CardDescription>{t("verifyEmail.failedDescription")}</CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href={routes.auth.signup}
            className="text-sm underline underline-offset-4"
          >
            {t("verifyEmail.backToSignup")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">
          {t("verifyEmail.successTitle")}
        </CardTitle>
        <CardDescription>{t("verifyEmail.successDescription")}</CardDescription>
      </CardHeader>

      <CardContent>
        <Link
          href={routes.auth.login}
          className="text-sm underline underline-offset-4"
        >
          {t("verifyEmail.goToSignin")}
        </Link>
      </CardContent>
    </Card>
  );
}
