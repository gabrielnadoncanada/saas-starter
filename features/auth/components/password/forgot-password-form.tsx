"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { requestPasswordReset } from "@/features/auth/client/auth-requests";
import {
  emailDefaultValues,
  emailSchema,
  type EmailValues,
} from "@/features/auth/schemas/auth-forms.schema";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: emailDefaultValues,
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await requestPasswordReset(email);
      setSent(true);
      reset(emailDefaultValues);
      toast.success(t("forgotPasswordPage.successMessage"));
    } catch {
      toast.error(t("forgotPasswordPage.errorMessage"));
    }
  });

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("forgotPasswordPage.successMessage")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="forgot-password-email">{t("email")}</FieldLabel>
        <Input
          id="forgot-password-email"
          type="email"
          aria-invalid={Boolean(errors.email)}
          required
          {...register("email")}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("forgotPasswordPage.sendingResetLink")}
          </>
        ) : (
          t("forgotPasswordPage.sendResetLink")
        )}
      </Button>
    </form>
  );
}
