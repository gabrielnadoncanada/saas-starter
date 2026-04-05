"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { resendVerificationEmail } from "@/features/auth/client/auth-api-client";
import { Button } from "@/shared/components/ui/button";

type ResendVerificationFormProps = {
  email: string;
};

export function ResendVerificationForm({ email }: ResendVerificationFormProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleResend() {
    setIsPending(true);

    try {
      await resendVerificationEmail(email);
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
