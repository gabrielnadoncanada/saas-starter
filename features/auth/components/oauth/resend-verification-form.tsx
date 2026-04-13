"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  type ResendVerificationActionState,
  resendVerificationEmailAction,
} from "@/features/auth/actions/public-auth.actions";
import { useToastMessage } from "@/hooks/use-toast-message";

type ResendVerificationFormProps = {
  email: string;
  callbackUrl?: string;
};

export function ResendVerificationForm({
  email,
  callbackUrl,
}: ResendVerificationFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResendVerificationActionState,
    FormData
  >(resendVerificationEmailAction, {});

  useToastMessage(state.error, { kind: "error", trigger: state });
  useToastMessage(state.success, { kind: "success", trigger: state });

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Sending email..." : "Resend verification email"}
      </Button>
    </form>
  );
}
