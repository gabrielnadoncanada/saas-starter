import { z } from "zod";

import type { FormActionState } from "@/shared/types/form-action-state";
import {
  type AuthenticatedUser,
  validatedAuthenticatedAction,
} from "@/shared/lib/auth/authenticated-action";
import {
  getRequiredOrganizationMembership,
  OrganizationMembershipError,
} from "@/features/organizations/server/get-required-organization-membership";

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
>(
  schema: S,
  action: ValidatedOrganizationOwnerActionHandler<S, TExtraState>,
) {
  type Values = z.infer<S>;
  type State = FormActionState<Values> & TExtraState;

  return validatedAuthenticatedAction<S, TExtraState>(
    schema,
    async (data, formData, user) => {
      try {
        const membership = await getRequiredOrganizationMembership(user.id, ["owner"]);

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


