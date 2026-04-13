import { z } from "zod";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/entitlements";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import {
  type CurrentUser,
  getCurrentUser,
} from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

const ORGANIZATION_NOT_FOUND_MESSAGE = "Organization not found";

type BillingErrorState = {
  error: string;
  errorCode?: FormActionState["errorCode"];
};

function billingErrorFrom(error: unknown): BillingErrorState | null {
  if (error instanceof UpgradeRequiredError) {
    return { error: error.message, errorCode: "UPGRADE_REQUIRED" };
  }
  if (error instanceof LimitReachedError) {
    return { error: error.message, errorCode: "LIMIT_REACHED" };
  }
  if (error instanceof OrganizationMembershipError) {
    return { error: error.message };
  }
  if (
    error instanceof Error &&
    error.message === ORGANIZATION_NOT_FOUND_MESSAGE
  ) {
    return { error: error.message };
  }
  return null;
}

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

function withActionState<Values extends Record<string, unknown>, State>(
  runAction: (formData: FormData) => Promise<State>,
) {
  async function action(
    _prevState: FormActionState<Values>,
    formData: FormData,
  ): Promise<State>;
  async function action(formData: FormData): Promise<void>;
  async function action(
    firstArg: FormData | FormActionState<Values>,
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

export function validatedPublicAction<
  Schema extends z.ZodTypeAny,
  State extends FormActionState<z.infer<Schema>>,
>(
  schema: Schema,
  handler: (data: z.infer<Schema>, formData: FormData) => Promise<State>,
) {
  return withActionState<z.infer<Schema>, State>(async (formData) => {
    const validationError = buildValidationErrorState(schema, formData);

    if (validationError) {
      return validationError as State;
    }

    const data = schema.parse(Object.fromEntries(formData));
    return handler(data, formData);
  });
}

/**
 * Wraps a server action with authentication + zod validation and produces a
 * function that plugs directly into React's `useActionState`.
 *
 * The wrapper:
 * 1. Calls `getCurrentUser()`. If the user is not signed in it returns
 *    `{ error: "You are not signed in." }` or delegates to
 *    `options.onUnauthenticated` if provided.
 * 2. Parses `FormData` through the Zod `schema`. On failure it returns a
 *    `FormActionState` with sticky `values` and per-field errors.
 * 3. Invokes `handler(data, formData, user)` with a fully typed, validated
 *    payload and a guaranteed non-null user.
 * 4. Catches `UpgradeRequiredError` / `LimitReachedError` /
 *    `OrganizationMembershipError` automatically and maps them to a
 *    `{ error, errorCode? }` state — no need to wrap handlers manually.
 *
 * `Result` is inferred from the handler's return type, so callers don't need
 * to spell it out. The returned action supports both `useActionState`
 * (prev + formData) and bare `action={fn}` form submissions.
 */
export function validatedAuthenticatedAction<
  Schema extends z.ZodTypeAny,
  State extends FormActionState<z.infer<Schema>>,
>(
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    formData: FormData,
    user: CurrentUser,
  ) => Promise<State>,
  options?: {
    onUnauthenticated?: (
      formData: FormData,
      rawValues: Record<string, unknown>,
    ) => Promise<State> | State;
  },
) {
  return withActionState<z.infer<Schema>, State>(async (formData) => {
    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const user = await getCurrentUser();

    if (!user) {
      if (options?.onUnauthenticated) {
        return options.onUnauthenticated(formData, rawValues);
      }

      return { error: "You are not signed in." } as State;
    }

    const validationError = buildValidationErrorState(schema, formData);

    if (validationError) {
      return validationError as State;
    }

    const data = schema.parse(rawValues);

    try {
      return await handler(data, formData, user);
    } catch (error) {
      const mapped = billingErrorFrom(error);
      if (mapped) {
        return mapped as State;
      }
      throw error;
    }
  });
}

/**
 * Sugar over `validatedAuthenticatedAction` for actions that require the caller
 * to be an **owner** of the active organization. The composer:
 *
 * 1. Runs the full auth + zod pipeline.
 * 2. Calls `requireActiveOrganizationRole(["owner"])` — honoring `redirectTo`
 *    so billing flows can bounce non-owners to the members page.
 * 3. Invokes `handler(data, ctx)` where `ctx` is `{ organizationId, user, formData }`.
 *
 * `OrganizationMembershipError` is still mapped to an error state automatically.
 */
export function validatedOrganizationOwnerAction<
  Schema extends z.ZodTypeAny,
  State extends FormActionState<z.infer<Schema>>,
>(
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    context: {
      organizationId: string;
      user: CurrentUser;
      formData: FormData;
    },
  ) => Promise<State>,
  options?: {
    redirectTo?: string;
    onUnauthenticated?: (
      formData: FormData,
      rawValues: Record<string, unknown>,
    ) => Promise<State> | State;
  },
) {
  return validatedAuthenticatedAction<Schema, State>(
    schema,
    async (data, formData, user) => {
      const membership = await requireActiveOrganizationRole(["owner"], {
        redirectTo: options?.redirectTo,
      });

      return handler(data, {
        formData,
        organizationId: membership.organizationId,
        user,
      });
    },
    { onUnauthenticated: options?.onUnauthenticated },
  );
}
