export type FieldErrors<TValues extends Record<string, unknown>> = Partial<
  Record<Extract<keyof TValues, string>, string[]>
>;

export type BillingErrorCode = "UPGRADE_REQUIRED" | "LIMIT_REACHED";

/**
 * Discriminated state returned by every server action in this codebase and
 * consumed by `useActionState` on the client. `TValues` should match the Zod
 * schema's inferred type so `fieldErrors` is type-checked against the form's
 * actual field names.
 *
 * Exactly one of `success` / `error` is typically set per response:
 * - `success`   → toast message on success.
 * - `error`     → top-level form error (invalid credentials, billing, etc.).
 * - `errorCode` → set to `"UPGRADE_REQUIRED"` or `"LIMIT_REACHED"` when the
 *                 error came from a billing guard. The `FormStatus` component
 *                 uses this to render an upgrade prompt instead of a red banner.
 * - `values`    → sticky form values echoed back on validation failure so the
 *                 user doesn't lose their input.
 * - `fieldErrors` → per-field messages rendered inline by `<FormField />`.
 *
 * @example
 * ```ts
 * import type { CreateTaskValues } from "@/features/tasks/task.schema";
 * import type { FormActionState } from "@/shared/types/form-action-state";
 *
 * export type CreateTaskActionState = FormActionState<CreateTaskValues> & {
 *   task?: Task;
 * };
 * ```
 *
 * @example Client usage with `useActionState`
 * ```tsx
 * const [state, formAction] = useActionState(createTaskAction, {});
 * // state.fieldErrors.title?.[0]  → inline error under the Title input
 * // state.errorCode === "LIMIT_REACHED" → render upgrade banner
 * ```
 */
export type FormActionState<
  TValues extends Record<string, unknown> = Record<string, never>,
> = {
  error?: string;
  errorCode?: BillingErrorCode;
  success?: string;
  values?: Partial<TValues>;
  fieldErrors?: FieldErrors<TValues>;
};
