import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

type ValidatedAuthenticatedOptions = {
  validationNamespace?: string;
};

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
>(
  schema: S,
  action: ValidatedAuthenticatedActionHandler<S, TExtraState>,
  options?: ValidatedAuthenticatedOptions,
) {
  type Values = z.infer<S>;
  type State = FormActionState<Values> & TExtraState;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const tCommon = await getTranslations("common");
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: tCommon("notAuthenticated"),
      } as State;
    }

    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const parsed = schema.safeParse(rawValues);

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors = { ...flat.fieldErrors } as Record<
        string,
        string[] | undefined
      >;

      if (options?.validationNamespace) {
        const t = await getTranslations(options.validationNamespace);

        for (const [field, issues] of Object.entries(fieldErrors)) {
          if (!issues) {
            continue;
          }

          fieldErrors[field] = issues.map((msg) => {
            if (!msg || msg.includes(" ")) {
              return msg;
            }

            return t(`validation.${msg}` as never);
          });
        }
      }

      return {
        error: tCommon("formValidationFailed"),
        values: rawValues as Partial<Values>,
        fieldErrors: fieldErrors as State["fieldErrors"],
      } as State;
    }

    return action(parsed.data, formData, user);
  };
}
