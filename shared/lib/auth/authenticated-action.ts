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
) {
  type Values = z.infer<Schema>;
  type State = FormActionState<Values> & Result;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You are not signed in." } as State;
    }

    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
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
  };
}
