import { z } from "zod";
import type { FormActionState } from "@/shared/types/form-action-state";

type ValidatedActionFunction<
  S extends z.ZodTypeAny,
  TExtraState extends object,
> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<FormActionState<z.infer<S>> & TExtraState>;

export function validatedAction<
  S extends z.ZodTypeAny,
  TExtraState extends object = Record<string, never>,
>(
  schema: S,
  action: ValidatedActionFunction<S, TExtraState>,
) {
  type Values = z.infer<S>;
  type State = FormActionState<Values> & TExtraState;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const parsed = schema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Please fix the highlighted fields.",
        values: rawValues as Partial<Values>,
        fieldErrors: parsed.error.flatten().fieldErrors as State["fieldErrors"],
      } as State;
    }

    return action(parsed.data, formData);
  };
}
