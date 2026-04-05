"use client";

import type { SubmitEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

type AuthEmailStepProps = {
  formId: string;
  label: string;
  submitLabel: string;
  emailField: UseFormRegisterReturn<"email">;
  emailError?: string;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
};

export function AuthEmailStep({
  formId,
  label,
  submitLabel,
  emailField,
  emailError,
  onSubmit,
}: AuthEmailStepProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field data-invalid={Boolean(emailError)}>
        <FieldLabel htmlFor={formId}>{label}</FieldLabel>
        <Input
          id={formId}
          type="email"
          autoComplete="email"
          placeholder={"Enter your email address..."}
          aria-invalid={Boolean(emailError)}
          required
          {...emailField}
        />
        <FieldError>{emailError}</FieldError>
      </Field>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
