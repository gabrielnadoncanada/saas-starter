import { z } from "zod";

import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

const NOT_AUTHENTICATED = "You are not signed in.";
const FORM_VALIDATION_FAILED = "Please fix the highlighted fields.";

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

type ValidatedAuthenticatedActionHandler<
  S extends z.ZodTypeAny,
  TExtraState extends object,
> = (
  data: z.infer<S>,
  formData: FormData,
  user: AuthenticatedUser,
) => Promise<FormActionState<z.infer<S>> & TExtraState>;

export function validatedAuthenticatedAction<
  S extends z.ZodTypeAny,
  TExtraState extends object = {},
>(schema: S, action: ValidatedAuthenticatedActionHandler<S, TExtraState>) {
  type Values = z.infer<S>;
  type State = FormActionState<Values> & TExtraState;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: NOT_AUTHENTICATED,
      } as State;
    }

    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const parsed = schema.safeParse(rawValues);

    if (!parsed.success) {
      const flat = parsed.error.flatten();

      return {
        error: FORM_VALIDATION_FAILED,
        values: rawValues as Partial<Values>,
        fieldErrors: flat.fieldErrors as State["fieldErrors"],
      } as State;
    }

    return action(parsed.data, formData, user);
  };
}
