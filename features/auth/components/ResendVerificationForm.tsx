"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resendVerificationEmailAction } from "@/features/auth/actions/resend-verification-email.action";
import type { ResendVerificationEmailActionState } from "@/features/auth/types/credentials-auth.types";
import { AuthFlowHiddenFields } from "@/features/auth/components/AuthFlowHiddenFields";
import { Button } from "@/shared/components/ui/button";
import { useFormActionToasts } from "@/shared/hooks/useFormActionToasts";

type ResendVerificationFormProps = {
  email: string;
  redirect?: string | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function ResendVerificationForm({
  email,
  ...flow
}: ResendVerificationFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResendVerificationEmailActionState,
    FormData
  >(resendVerificationEmailAction, {});

  useFormActionToasts(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      <AuthFlowHiddenFields {...flow} />
      <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending email...
          </>
        ) : (
          "Resend verification email"
        )}
      </Button>
    </form>
  );
}
