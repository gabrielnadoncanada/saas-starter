import { z } from "zod";

import {
  type CurrentUser,
  getCurrentUser,
} from "@/lib/auth/get-current-user";
import type { FormActionState } from "@/types/form-action-state";

export type AuthenticatedActionContext = {
  formData: FormData;
  user: CurrentUser;
};

function buildValidationErrorState<Schema extends z.ZodTypeAny>(
  schema: Schema,
  formData: FormData,
): FormActionState<z.infer<Schema>> | null {
  const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = schema.safeParse(rawValues);

  if (parsed.success) {
    return null;
  }

  const flat = parsed.error.flatten();

  return {
    error: "Please fix the highlighted fields.",
    values: rawValues as Partial<z.infer<Schema>>,
    fieldErrors: flat.fieldErrors as FormActionState<
      z.infer<Schema>
    >["fieldErrors"],
  };
}

export function validatedPublicAction<
  Schema extends z.ZodTypeAny,
  State extends FormActionState<z.infer<Schema>>,
>(
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    context: { formData: FormData },
  ) => Promise<State>,
) {
  return async (
    _prevState: FormActionState<z.infer<Schema>>,
    formData: FormData,
  ): Promise<State> => {
    const validationError = buildValidationErrorState(schema, formData);

    if (validationError) {
      return validationError as State;
    }

    const data = schema.parse(Object.fromEntries(formData));
    return handler(data, { formData });
  };
}

/**
 * The boring default for app forms:
 * auth, validate, run handler.
 */
export function validatedAuthenticatedAction<
  Schema extends z.ZodTypeAny,
  State extends FormActionState<z.infer<Schema>>,
>(
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    context: AuthenticatedActionContext,
  ) => Promise<State>,
) {
  return async (
    _prevState: FormActionState<z.infer<Schema>>,
    formData: FormData,
  ): Promise<State> => {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "You are not signed in." } as State;
    }

    const validationError = buildValidationErrorState(schema, formData);

    if (validationError) {
      return validationError as State;
    }

    const data = schema.parse(Object.fromEntries(formData));
    return handler(data, { formData, user });
  };
}
