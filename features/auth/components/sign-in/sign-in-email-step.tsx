"use client";

import type { FormEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

type SignInEmailStepProps = {
  emailField: UseFormRegisterReturn<"email">;
  emailError?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SignInEmailStep({
  emailField,
  emailError,
  onSubmit,
}: SignInEmailStepProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field data-invalid={Boolean(emailError)}>
        <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
        <Input
          id="sign-in-email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address..."
          aria-invalid={Boolean(emailError)}
          required
          {...emailField}
        />
        <FieldError>{emailError}</FieldError>
      </Field>

      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
