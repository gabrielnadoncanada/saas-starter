import { z } from "zod";

import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

type AuthUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

type ValidatedActionWithUserFunction<
  S extends z.ZodTypeAny,
  TExtraState extends object,
> = (
  data: z.infer<S>,
  formData: FormData,
  user: AuthUser,
) => Promise<FormActionState<z.infer<S>> & TExtraState>;

export function validatedActionWithUser<
  S extends z.ZodTypeAny,
  TExtraState extends object = Record<string, never>,
>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, TExtraState>,
) {
  type Values = z.infer<S>;
  type State = FormActionState<Values> & TExtraState;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: "User is not authenticated.",
      } as State;
    }

    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const parsed = schema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Please fix the highlighted fields.",
        values: rawValues as Partial<Values>,
        fieldErrors: parsed.error.flatten().fieldErrors as State["fieldErrors"],
      } as State;
    }

    return action(parsed.data, formData, user);
  };
}
