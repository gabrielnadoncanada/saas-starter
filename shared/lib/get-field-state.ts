import type { FormActionState } from "@/shared/types/form-action-state";

export function getFieldState<
  TValues extends Record<string, unknown>,
  TName extends Extract<keyof TValues, string>,
>(state: FormActionState<TValues>, name: TName) {
  const error = state.fieldErrors?.[name]?.[0];

  return {
    error,
    invalid: Boolean(error),
  };
}
