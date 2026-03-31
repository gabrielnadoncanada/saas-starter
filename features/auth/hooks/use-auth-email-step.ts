"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  emailStepSchema,
  type EmailStepValues,
} from "@/features/auth/schemas/email-step.schema";
const defaultValues: EmailStepValues = {
  email: "",
};

type UseAuthEmailStepOptions = {
  onEmailChanged?: () => void;
  onEmailValidated?: () => void;
};

export function useAuthEmailStep(options: UseAuthEmailStepOptions = {}) {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const {
    clearErrors,
    formState: { errors },
    getValues,
    register,
    setError,
    setValue,
    trigger,
  } = useForm<EmailStepValues>({
    resolver: zodResolver(emailStepSchema),
    defaultValues,
  });

  const emailField = register("email", {
    onChange: () => {
      clearErrors();
      options.onEmailChanged?.();
    },
  });

  async function validateEmail() {
    if (!(await trigger("email"))) {
      return null;
    }

    const email = getValues("email").trim().toLowerCase();
    setValue("email", email, { shouldDirty: true, shouldValidate: true });
    clearErrors();
    options.onEmailValidated?.();
    return email;
  }

  async function continueToPasswordStep() {
    const email = await validateEmail();

    if (!email) {
      return null;
    }

    setSubmittedEmail(email);
    setShowPasswordStep(true);
    return email;
  }

  function returnToEmailStep() {
    setShowPasswordStep(false);
    options.onEmailChanged?.();
  }

  function setEmailError(message: string) {
    setShowPasswordStep(false);
    setError("email", {
      type: "server",
      message,
    });
  }

  return {
    emailError: errors.email?.message,
    emailField,
    continueToPasswordStep,
    returnToEmailStep,
    setEmailError,
    showPasswordStep,
    submittedEmail,
    validateEmail,
  };
}
