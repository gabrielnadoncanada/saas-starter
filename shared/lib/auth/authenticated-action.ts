import { z } from "zod";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/plans";
import { OrganizationMembershipError } from "@/features/organizations/server/organizations";
import {
  type CurrentUser,
  getCurrentUser,
} from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

const ORGANIZATION_NOT_FOUND_MESSAGE = "Organization not found";

export type BillingActionError = Required<
  Pick<FormActionState, "error">
> & {
  errorCode?: FormActionState["errorCode"];
};

function billingErrorFrom(error: unknown): BillingActionError | null {
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

/**
 * Runs an async action and converts known billing / org-context errors into
 * {@link BillingActionError}; other errors are rethrown.
 *
 * Catches:
 * - {@link UpgradeRequiredError} → `{ error, errorCode: "UPGRADE_REQUIRED" }`
 * - {@link LimitReachedError}    → `{ error, errorCode: "LIMIT_REACHED" }`
 * - `OrganizationMembershipError` and `"Organization not found"` errors
 *   → `{ error }` without an errorCode.
 *
 * Wrap the body of any server action that can hit a billing guard. The
 * returned shape is assignable to `FormActionState<T>`, so the client form
 * will render the right banner automatically.
 *
 * @example
 * ```ts
 * export const createInvoiceAction = validatedAuthenticatedAction(
 *   createInvoiceSchema,
 *   async (data) => {
 *     return withBillingErrors(async () => {
 *       const invoice = await createInvoice(data);
 *       revalidatePath(routes.app.invoices);
 *       return { success: "Invoice created", invoice };
 *     });
 *   },
 * );
 * ```
 */
export async function withBillingErrors<T>(
  fn: () => Promise<T>,
): Promise<T | BillingActionError> {
  try {
    return await fn();
  } catch (error) {
    const mapped = billingErrorFrom(error);
    if (mapped) {
      return mapped;
    }
    throw error;
  }
}

type ActionState<
  Schema extends z.ZodTypeAny,
  Result extends object,
> = FormActionState<z.infer<Schema>> & Result;

function buildValidationErrorState<
  Schema extends z.ZodTypeAny,
  Result extends object,
>(schema: Schema, formData: FormData): ActionState<Schema, Result> | null {
  type State = ActionState<Schema, Result>;
  type Values = z.infer<Schema>;

  const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
  const parsed = schema.safeParse(rawValues);

  if (parsed.success) {
    return null;
  }

  const flat = parsed.error.flatten();

  return {
    error: "Please fix the highlighted fields.",
    values: rawValues as Partial<Values>,
    fieldErrors: flat.fieldErrors as State["fieldErrors"],
  } as State;
}

function withActionState<Schema extends z.ZodTypeAny, Result extends object>(
  runAction: (formData: FormData) => Promise<ActionState<Schema, Result>>,
) {
  type State = ActionState<Schema, Result>;

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

export function validatedPublicAction<
  Schema extends z.ZodTypeAny,
  Result extends object = {},
>(
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    formData: FormData,
  ) => Promise<ActionState<Schema, Result>>,
) {
  type State = ActionState<Schema, Result>;

  return async (_prevState: State, formData: FormData): Promise<State> => {
    const validationError = buildValidationErrorState<Schema, Result>(
      schema,
      formData,
    );

    if (validationError) {
      return validationError;
    }

    const data = schema.parse(Object.fromEntries(formData));
    return handler(data, formData) as Promise<State>;
  };
}

/**
 * Wraps a server action with authentication + zod validation and produces a
 * function that plugs directly into React's `useActionState`.
 *
 * The wrapper:
 * 1. Calls {@link getCurrentUser}. If the user is not signed in it either
 *    returns `{ error: "You are not signed in." }` or delegates to
 *    `options.onUnauthenticated` if provided.
 * 2. Parses `FormData` through the Zod `schema`. On failure it returns a
 *    {@link FormActionState} with `values` (sticky) and per-field errors that
 *    `<FormField />` renders inline.
 * 3. Invokes `handler(data, formData, user)` with a fully typed, validated
 *    payload and a guaranteed non-null user.
 *
 * The returned action supports both `useActionState` (prev + formData) and
 * bare `action={fn}` form submissions.
 *
 * @example Basic usage
 * ```ts
 * export const updateProfileAction = validatedAuthenticatedAction(
 *   updateProfileSchema,
 *   async (data, _formData, user) => {
 *     await prisma.user.update({ where: { id: user.id }, data });
 *     return { success: "Profile updated" };
 *   },
 * );
 * ```
 *
 * @example With billing guards
 * ```ts
 * export const createTaskAction = validatedAuthenticatedAction<
 *   typeof createTaskSchema,
 *   { task?: Task }
 * >(createTaskSchema, async (data) => {
 *   return withBillingErrors(async () => {
 *     const task = await createTask(data);
 *     revalidatePath(routes.app.tasks);
 *     return { success: "Task created", task };
 *   });
 * });
 * ```
 *
 * @example Redirecting unauthenticated users to sign in
 * ```ts
 * export const commentAction = validatedAuthenticatedAction(
 *   commentSchema,
 *   async (data, _formData, user) => { ... },
 *   {
 *     onUnauthenticated: () => ({ error: "Sign in to comment." }),
 *   },
 * );
 * ```
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
  type State = ActionState<Schema, Result>;

  return withActionState<Schema, Result>(async (formData) => {
    const rawValues = Object.fromEntries(formData) as Record<string, unknown>;
    const user = await getCurrentUser();

    if (!user) {
      if (options?.onUnauthenticated) {
        return options.onUnauthenticated(formData, rawValues) as Promise<State>;
      }

      return { error: "You are not signed in." } as State;
    }

    const validationError = buildValidationErrorState<Schema, Result>(
      schema,
      formData,
    );

    if (validationError) {
      return validationError;
    }

    const data = schema.parse(rawValues);
    return handler(data, formData, user);
  });
}
