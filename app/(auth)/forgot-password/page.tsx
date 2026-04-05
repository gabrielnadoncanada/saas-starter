import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/features/auth/components/password/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">
          {t("forgotPasswordPage.title")}
        </CardTitle>
        <CardDescription>{t("forgotPasswordPage.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <ForgotPasswordForm />
          <p className="text-sm text-muted-foreground">
            {t("forgotPasswordPage.rememberedPrompt")}{" "}
            <Link
              href={routes.auth.login}
              className="underline underline-offset-4"
            >
              {t("forgotPasswordPage.backToSignIn")}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
