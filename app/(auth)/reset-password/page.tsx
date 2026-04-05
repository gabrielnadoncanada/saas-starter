import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "@/features/auth/components/password/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token: rawToken } = await searchParams;
  const token = rawToken?.trim();
  const t = await getTranslations("auth");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("resetPassword.title")}</CardTitle>
        <CardDescription>
          {token ? t("resetPassword.description") : t("resetPassword.invalidDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link
              href={routes.auth.forgotPassword}
              className="underline underline-offset-4"
            >
              {t("resetPassword.requestNewLink")}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
