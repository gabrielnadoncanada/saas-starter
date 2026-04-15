"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

type TwoFactorSettingsCardProps = {
  enabled: boolean;
};

export function TwoFactorSettingsCard({
  enabled: initialEnabled,
}: TwoFactorSettingsCardProps) {
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
    toast.success(
      "Scan the QR code, then verify with a code from your authenticator app.",
    );
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
    toast.success("Two-factor authentication enabled.");
  }

  async function disableTwoFactor() {
    const result = await authClient.twoFactor.disable({
      password,
    });

    if (result.error) {
      toast.error(
        result.error.message ?? "Unable to disable two-factor authentication.",
      );
      return;
    }

    setEnabled(false);
    setBackupCodes([]);
    setTotpUri(null);
    setCode("");
    toast.success("Two-factor authentication disabled.");
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
    toast.success("Backup codes regenerated.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          Protect your account with an authenticator app and backup codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="two-factor-password">Current password</Label>
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
            {isPending ? "Preparing..." : "Set up two-factor"}
          </Button>
        ) : null}

        {totpUri ? (
          <div className="space-y-4 border border-border bg-muted/30 p-4">
            <p className="label-mono">Step 1 · Scan</p>
            {qrCodeDataUrl ? (
              <Image
                src={qrCodeDataUrl}
                alt="Authenticator QR code"
                className="border border-border bg-white p-3"
                width={192}
                height={192}
              />
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="two-factor-code" className="label-mono">
                Step 2 · Verification code
              </Label>
              <Input
                id="two-factor-code"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                className="font-mono tabular-nums tracking-[0.2em]"
              />
            </div>
            <Button
              disabled={!code || isPending}
              onClick={() => startTransition(() => void verifySetup())}
            >
              {isPending ? "Verifying..." : "Verify and enable"}
            </Button>
          </div>
        ) : null}

        {enabled ? (
          <div className="space-y-3 border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 bg-brand" />
              <p className="label-mono text-foreground">Active</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is protecting this account.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!password || isPending}
                onClick={() =>
                  startTransition(() => void regenerateBackupCodes())
                }
              >
                Regenerate backup codes
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={!password || isPending}
                onClick={() => startTransition(() => void disableTwoFactor())}
              >
                Disable two-factor
              </Button>
            </div>
          </div>
        ) : null}

        {backupCodes.length > 0 ? (
          <div className="border border-dashed border-brand/40 bg-brand/5 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="label-mono text-brand">Backup codes</p>
              <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {backupCodes.length} codes
              </p>
            </div>
            <div className="mt-3 grid gap-px bg-border sm:grid-cols-2">
              {backupCodes.map((backupCode) => (
                <code
                  key={backupCode}
                  className="bg-background px-3 py-2 font-mono text-sm tabular-nums tracking-[0.1em]"
                >
                  {backupCode}
                </code>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Store these somewhere safe — each code can be used once.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
