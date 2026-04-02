"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { sendMagicLink } from "@/features/auth/client/auth-requests";

type ResendMagicLinkButtonProps = {
  email: string;
  callbackUrl?: string | null;
};

export function ResendMagicLinkButton({
  email,
  callbackUrl = "/post-sign-in",
}: ResendMagicLinkButtonProps) {
  const t = useTranslations("auth");
  const [isPending, setIsPending] = useState(false);
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";

  async function handleResend() {
    try {
      setIsPending(true);
      await sendMagicLink(email, nextCallbackUrl);
      toast.success(t("checkEmail.resendSuccess"));
    } catch {
      toast.error(t("checkEmail.resendError"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      className="font-medium underline underline-offset-4 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      onClick={() => void handleResend()}
      disabled={isPending}
    >
      {isPending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("checkEmail.sending")}
        </span>
      ) : (
        t("checkEmail.resendLink")
      )}
    </button>
  );
}
