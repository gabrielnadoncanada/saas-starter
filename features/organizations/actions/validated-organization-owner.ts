import { z } from "zod";

import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import {
  type AuthenticatedUser,
  validatedAuthenticatedAction,
} from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

type OrganizationOwnerActionContext = {
  organizationId: string;
  user: AuthenticatedUser;
};

type ValidatedOrganizationOwnerActionHandler<
  S extends z.ZodTypeAny,
  TExtraState extends object,
> = (
  data: z.infer<S>,
  formData: FormData,
  context: OrganizationOwnerActionContext,
) => Promise<FormActionState<z.infer<S>> & TExtraState>;

export function validatedOrganizationOwnerAction<
  S extends z.ZodTypeAny,
  TExtraState extends object = {},
>(schema: S, action: ValidatedOrganizationOwnerActionHandler<S, TExtraState>) {
  type Values = z.infer<S>;
  type State = FormActionState<Values> & TExtraState;

  return validatedAuthenticatedAction<S, TExtraState>(
    schema,
    async (data, formData, user) => {
      try {
        const membership = await requireActiveOrganizationRole(["owner"]);

        return action(data, formData, {
          organizationId: membership.organizationId,
          user,
        });
      } catch (error) {
        if (error instanceof OrganizationMembershipError) {
          return { error: error.message } as State;
        }

        throw error;
      }
    },
  );
}
