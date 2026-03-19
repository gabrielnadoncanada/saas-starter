"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setIsPending(true);
    setEmailError("");

    try {
      await authClient.requestPasswordReset({
        email: normalizedEmail,
        redirectTo: "/reset-password",
      });

      setSent(true);
      toast.success("If an account exists for this email, a reset link has been sent.");
    } catch {
      toast.error("Unable to send reset link. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for this email, a reset link has been sent. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field data-invalid={Boolean(emailError)}>
        <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
        <Input
          id="forgot-password-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError("");
          }}
          aria-invalid={Boolean(emailError)}
          required
        />
        <FieldError>{emailError}</FieldError>
      </Field>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
