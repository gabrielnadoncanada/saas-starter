"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { sendMagicLink } from "@/features/auth/client/auth-api-client";

type ResendMagicLinkButtonProps = {
  email: string;
  callbackUrl?: string | null;
};

export function ResendMagicLinkButton({
  email,
  callbackUrl = "/post-sign-in",
}: ResendMagicLinkButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const nextCallbackUrl = callbackUrl ?? "/post-sign-in";

  async function handleResend() {
    try {
      setIsPending(true);
      await sendMagicLink(email, nextCallbackUrl);
      toast.success("A new sign-in link has been sent.");
    } catch {
      toast.error("Unable to send a new sign-in link. Please try again.");
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
          Sending...
        </span>
      ) : (
        "Resend a new one"
      )}
    </button>
  );
}
