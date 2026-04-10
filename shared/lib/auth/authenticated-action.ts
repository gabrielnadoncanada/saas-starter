import { z } from "zod";

import {
  type CurrentUser,
  getCurrentUser,
} from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

/**
 * Wraps a server action with authentication + zod validation.
 *
 * Usage:
 *   export const myAction = validatedAuthenticatedAction(mySchema, async (data, formData, user) => {
 *     // data is already validated, user is guaranteed non-null
 *     return { success: "Done" };
 *   });
 */
export function validatedAuthenticatedAction<
  Schema extends z.ZodTypeAny,
  Result extends object = {},
>(
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    formData: FormData,
    user: CurrentUser,
  ) => Promise<FormActionState<z.infer<Schema>> & Result>,
  options?: {
    onUnauthenticated?: (
      formData: FormData,
      rawValues: Record<string, unknown>,
    ) =>
      | Promise<FormActionState<z.infer<Schema>> & Result>
      | (FormActionState<z.infer<Schema>> & Result);
  },
) {
  type Values = z.infer<Schema>;
  type State = FormActionState<Values> & Result;

  async function runAction(formData: FormData): Promise<State> {
    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const user = await getCurrentUser();

    if (!user) {
      if (options?.onUnauthenticated) {
        return options.onUnauthenticated(formData, rawValues) as Promise<State>;
      }

      return { error: "You are not signed in." } as State;
    }

    const parsed = schema.safeParse(rawValues);

    if (!parsed.success) {
      const flat = parsed.error.flatten();

      return {
        error: "Please fix the highlighted fields.",
        values: rawValues as Partial<Values>,
        fieldErrors: flat.fieldErrors as State["fieldErrors"],
      } as State;
    }

    return handler(parsed.data, formData, user);
  }

  async function action(formData: FormData): Promise<void>;
  async function action(_prevState: State, formData: FormData): Promise<State>;
  async function action(
    firstArg: FormData | State,
    secondArg?: FormData,
  ): Promise<void | State> {
    if (firstArg instanceof FormData) {
      await runAction(firstArg);
      return;
    }

    return runAction(secondArg as FormData);
  }

  return action;
}
