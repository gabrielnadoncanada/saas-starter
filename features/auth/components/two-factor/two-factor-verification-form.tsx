"use client";

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
      toast.error(result.error.message ?? "Invalid verification code.");
      return;
    }

    toast.success("Verification complete.");
    await completeSignIn();
  }

  async function verifyBackupCode() {
    const result = await authClient.twoFactor.verifyBackupCode({
      code: backupCode,
      trustDevice,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Invalid backup code.");
      return;
    }

    toast.success("Verification complete.");
    await completeSignIn();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Use authenticator code</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="two-factor-sign-in-code">Code</Label>
            <Input
              id="two-factor-sign-in-code"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
            />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={trustDevice}
              onCheckedChange={(checked) => setTrustDevice(Boolean(checked))}
            />
            Trust this device for future sign-ins
          </label>
          <Button
            disabled={!code || isPending}
            onClick={() => startTransition(() => void verifyAuthenticatorCode())}
          >
            {isPending ? "Verifying..." : "Verify code"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use backup code</CardTitle>
          <CardDescription>
            If you lost access to your authenticator, use one of your backup codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="two-factor-backup-code">Backup code</Label>
            <Input
              id="two-factor-backup-code"
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value)}
              placeholder="XXXX-XXXX"
            />
          </div>
          <Button
            variant="outline"
            disabled={!backupCode || isPending}
            onClick={() => startTransition(() => void verifyBackupCode())}
          >
            {isPending ? "Verifying..." : "Verify backup code"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
