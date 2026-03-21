"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { Button } from "@/shared/components/ui/button";

type ResendVerificationFormProps = {
  email: string;
  redirect?: string | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function ResendVerificationForm({
  email,
}: ResendVerificationFormProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleResend() {
    setIsPending(true);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: email.trim().toLowerCase(),
        callbackURL: "/sign-in",
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("A new verification email has been sent.");
    } catch {
      toast.error("Unable to send verification email. Please try again.");
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
          Sending email...
        </>
      ) : (
        "Resend verification email"
      )}
    </Button>
  );
}
