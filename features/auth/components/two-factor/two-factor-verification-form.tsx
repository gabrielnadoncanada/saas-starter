"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { authClient } from "@/lib/auth/auth-client";

type TwoFactorVerificationFormProps = {
  callbackUrl?: string | null;
};

type Method = "totp" | "backup";

export function TwoFactorVerificationForm({
  callbackUrl,
}: TwoFactorVerificationFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isPending, startTransition] = useTransition();

  function completeSignIn() {
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
    completeSignIn();
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
    completeSignIn();
  }

  const isTotp = method === "totp";

  return (
    <AuthShell
      eyebrow="Security · Two-factor"
      title="Confirm it's you"
      description="Enter a code from your authenticator or one of your saved backup codes."
    >
      <div className="space-y-5">
        <div
          role="tablist"
          aria-label="Verification method"
          className="grid grid-cols-2 gap-px border border-border bg-border"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isTotp}
            onClick={() => setMethod("totp")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors ${
              isTotp
                ? "bg-card text-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-card/60"
            }`}
          >
            <ShieldCheck className="size-3.5" strokeWidth={1.75} />
            Authenticator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isTotp}
            onClick={() => setMethod("backup")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition-colors ${
              !isTotp
                ? "bg-card text-foreground"
                : "bg-muted/30 text-muted-foreground hover:bg-card/60"
            }`}
          >
            <KeyRound className="size-3.5" strokeWidth={1.75} />
            Backup code
          </button>
        </div>

        {isTotp ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="two-factor-sign-in-code" className="label-mono">
                6-digit code
              </Label>
              <Input
                id="two-factor-sign-in-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                className="font-mono text-base tracking-[0.3em] tabular-nums"
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
              className="w-full"
              disabled={!code || isPending}
              onClick={() =>
                startTransition(() => void verifyAuthenticatorCode())
              }
            >
              {isPending ? "Verifying..." : "Verify code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="two-factor-backup-code" className="label-mono">
                Backup code
              </Label>
              <Input
                id="two-factor-backup-code"
                value={backupCode}
                onChange={(event) => setBackupCode(event.target.value)}
                placeholder="XXXX-XXXX"
                className="font-mono text-base tracking-[0.2em]"
              />
              <p className="text-xs text-muted-foreground">
                Each backup code can only be used once.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={!backupCode || isPending}
              onClick={() => startTransition(() => void verifyBackupCode())}
            >
              {isPending ? "Verifying..." : "Use backup code"}
            </Button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
