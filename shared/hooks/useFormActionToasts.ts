"use client";

import type { FormActionState } from "@/shared/types/form-action-state";

import { useToastMessage } from "./useToastMessage";

type UseFormActionToastsOptions = {
  skipError?: boolean;
};

export function useFormActionToasts<TValues extends Record<string, unknown>>(
  state: FormActionState<TValues>,
  options: UseFormActionToastsOptions = {},
) {
  const { skipError = Boolean(state.fieldErrors) } = options;

  useToastMessage(state.error, {
    kind: "error",
    skip: skipError,
    trigger: state,
  });

  useToastMessage(state.success, {
    kind: "success",
    trigger: state,
  });
}
