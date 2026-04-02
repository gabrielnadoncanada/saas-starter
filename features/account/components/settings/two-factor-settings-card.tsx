"use client";

import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { recordTwoFactorAuditAction } from "@/features/account/actions/two-factor-audit.action";
import { authClient } from "@/shared/lib/auth/auth-client";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type TwoFactorSettingsCardProps = {
  enabled: boolean;
};

export function TwoFactorSettingsCard({
  enabled: initialEnabled,
}: TwoFactorSettingsCardProps) {
  const t = useTranslations("twoFactor");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!totpUri) {
      setQrCodeDataUrl(null);
      return;
    }

    void QRCode.toDataURL(totpUri).then(setQrCodeDataUrl);
  }, [totpUri]);

  async function startSetup() {
    const result = await authClient.twoFactor.enable({
      password,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Unable to start two-factor setup.");
      return;
    }

    setTotpUri(result.data.totpURI);
    setBackupCodes(result.data.backupCodes);
    toast.success(t("scanSuccess"));
  }

  async function verifySetup() {
    const result = await authClient.twoFactor.verifyTotp({
      code,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Invalid verification code.");
      return;
    }

    setEnabled(true);
    setTotpUri(null);
    setCode("");
    const payload = new FormData();
    payload.set("event", "enabled");
    await recordTwoFactorAuditAction({}, payload);
    toast.success(t("enabled"));
  }

  async function disableTwoFactor() {
    const result = await authClient.twoFactor.disable({
      password,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Unable to disable two-factor authentication.");
      return;
    }

    setEnabled(false);
    setBackupCodes([]);
    setTotpUri(null);
    setCode("");

    const payload = new FormData();
    payload.set("event", "disabled");
    await recordTwoFactorAuditAction({}, payload);
    toast.success(t("disabled"));
  }

  async function regenerateBackupCodes() {
    const result = await authClient.twoFactor.generateBackupCodes({
      password,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Unable to regenerate backup codes.");
      return;
    }

    setBackupCodes(result.data.backupCodes);
    const payload = new FormData();
    payload.set("event", "backup_codes_regenerated");
    await recordTwoFactorAuditAction({}, payload);
    toast.success(t("regenerated"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="two-factor-password">{t("password")}</Label>
          <Input
            id="two-factor-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {!enabled && !totpUri ? (
          <Button
            disabled={!password || isPending}
            onClick={() => startTransition(() => void startSetup())}
          >
            {isPending ? t("preparing") : t("setup")}
          </Button>
        ) : null}

        {totpUri ? (
          <div className="space-y-4 rounded-lg border p-4">
            {qrCodeDataUrl ? (
              <Image
                src={qrCodeDataUrl}
                alt="Authenticator QR code"
                className="rounded-md border bg-white p-3"
                width={192}
                height={192}
              />
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="two-factor-code">{t("code")}</Label>
              <Input
                id="two-factor-code"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
              />
            </div>
            <Button
              disabled={!code || isPending}
              onClick={() => startTransition(() => void verifySetup())}
            >
              {isPending ? t("verifying") : t("verify")}
            </Button>
          </div>
        ) : null}

        {enabled ? (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              {t("active")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!password || isPending}
                onClick={() => startTransition(() => void regenerateBackupCodes())}
              >
                {t("regenerate")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!password || isPending}
                onClick={() => startTransition(() => void disableTwoFactor())}
              >
                {t("disable")}
              </Button>
            </div>
          </div>
        ) : null}

        {backupCodes.length > 0 ? (
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium">{t("backupCodes")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {backupCodes.map((backupCode) => (
                <code
                  key={backupCode}
                  className="rounded bg-muted px-3 py-2 text-sm"
                >
                  {backupCode}
                </code>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
