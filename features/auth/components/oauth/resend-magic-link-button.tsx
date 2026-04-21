"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { authClient } from "@/lib/auth/auth-client";

type ResendMagicLinkButtonProps = {
  email: string;
  callbackUrl?: string | null;
};

export function ResendMagicLinkButton({
  email,
  callbackUrl,
}: ResendMagicLinkButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const nextCallbackUrl = callbackUrl ?? routes.auth.postSignIn;

  async function handleResend() {
    try {
      setIsPending(true);
      const { error } = await authClient.signIn.magicLink({
        email: email.trim().toLowerCase(),
        callbackURL: nextCallbackUrl,
      });

      if (error) {
        throw new Error(error.message || "Unable to send a new sign-in link.");
      }

      toast.success("A new sign-in link has been sent.");
    } catch {
      toast.error("Unable to send a new sign-in link. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleResend()}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-1.5 size-3 animate-spin" strokeWidth={1.75} />
          Sending...
        </>
      ) : (
        <>
          <RotateCcw className="mr-1.5 size-3" strokeWidth={1.75} />
          Resend link
        </>
      )}
    </Button>
  );
}
