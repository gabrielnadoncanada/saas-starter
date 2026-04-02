"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useRouter } from "@/shared/i18n/navigation";
import { routes } from "@/shared/constants/routes";
import { authClient } from "@/shared/lib/auth/auth-client";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type TwoFactorVerificationFormProps = {
  callbackUrl?: string | null;
};

export function TwoFactorVerificationForm({
  callbackUrl,
}: TwoFactorVerificationFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function completeSignIn() {
    router.replace(callbackUrl || routes.app.dashboard);
    router.refresh();
  }

  async function verifyAuthenticatorCode() {
    const result = await authClient.twoFactor.verifyTotp({
      code,
      trustDevice,
    });

    if (result.error) {
      toast.error(result.error.message ?? t("twoFactor.invalidCode"));
      return;
    }

    toast.success(t("twoFactor.verificationComplete"));
    await completeSignIn();
  }

  async function verifyBackupCode() {
    const result = await authClient.twoFactor.verifyBackupCode({
      code: backupCode,
      trustDevice,
    });

    if (result.error) {
      toast.error(result.error.message ?? t("twoFactor.invalidBackupCode"));
      return;
    }

    toast.success(t("twoFactor.verificationComplete"));
    await completeSignIn();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("twoFactor.title")}</CardTitle>
          <CardDescription>{t("twoFactor.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="two-factor-sign-in-code">{t("twoFactor.codeLabel")}</Label>
            <Input
              id="two-factor-sign-in-code"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t("twoFactor.codePlaceholder")}
            />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={trustDevice}
              onCheckedChange={(checked) => setTrustDevice(Boolean(checked))}
            />
            {t("twoFactor.trustDevice")}
          </label>
          <Button
            disabled={!code || isPending}
            onClick={() => startTransition(() => void verifyAuthenticatorCode())}
          >
            {isPending ? t("twoFactor.verifying") : t("twoFactor.verifyCode")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("twoFactor.backupTitle")}</CardTitle>
          <CardDescription>{t("twoFactor.backupDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="two-factor-backup-code">{t("twoFactor.backupCodeLabel")}</Label>
            <Input
              id="two-factor-backup-code"
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value)}
              placeholder={t("twoFactor.backupCodePlaceholder")}
            />
          </div>
          <Button
            variant="outline"
            disabled={!backupCode || isPending}
            onClick={() => startTransition(() => void verifyBackupCode())}
          >
            {isPending ? t("twoFactor.verifying") : t("twoFactor.verifyBackupCode")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
