import type { FormActionState } from "@/types/form-action-state";

export function getFieldState<
  TValues extends Record<string, unknown>,
  TName extends Extract<keyof TValues, string>,
>(state: FormActionState<TValues>, name: TName, fallback?: string) {
  const error = state.fieldErrors?.[name]?.[0];
  const raw = state.values?.[name];
  const value = raw === undefined ? (fallback ?? "") : String(raw);

  return { error, invalid: Boolean(error), value };
}
