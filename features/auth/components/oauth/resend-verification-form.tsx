"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { resendVerificationEmail } from "@/features/auth/client/auth-requests";
import { Button } from "@/shared/components/ui/button";

type ResendVerificationFormProps = {
  email: string;
};

export function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const t = useTranslations("auth");
  const [isPending, setIsPending] = useState(false);

  async function handleResend() {
    setIsPending(true);

    try {
      await resendVerificationEmail(email);
      toast.success(t("verifyEmailSent.resendSuccess"));
    } catch {
      toast.error(t("verifyEmailSent.resendError"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => void handleResend()}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("verifyEmailSent.sendingEmail")}
        </>
      ) : (
        t("verifyEmailSent.resendButton")
      )}
    </Button>
  );
}
