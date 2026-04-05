"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/billing-errors";
import {
  assertCapability,
  assertLimit,
} from "@/features/billing/plan-guards";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import {
  invitationIdSchema,
  inviteOrganizationMemberSchema,
  removeOrganizationMemberSchema,
} from "@/features/organizations/schemas/organization.schema";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import {
  cancelOrganizationInvitation,
  inviteOrganizationMember,
  resendOrganizationInvitation,
} from "@/features/organizations/server/organization-invitations";
import {
  type AuthenticatedUser,
  validatedAuthenticatedAction,
} from "@/shared/lib/auth/authenticated-action";
import { auth } from "@/shared/lib/auth/auth-config";
import type { FormActionState } from "@/shared/types/form-action-state";

function validatedOrganizationOwnerAction<
  S extends z.ZodTypeAny,
  TExtraState extends object = {},
>(
  schema: S,
  action: (
    data: z.infer<S>,
    formData: FormData,
    context: { organizationId: string; user: AuthenticatedUser },
  ) => Promise<FormActionState<z.infer<S>> & TExtraState>,
) {
  type State = FormActionState<z.infer<S>> & TExtraState;

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

type RefreshableActionState<
  TValues extends Record<string, unknown> = Record<string, never>,
> = FormActionState<TValues> & {
  refreshKey?: number;
};

type InviteOrganizationMemberValues = z.infer<
  typeof inviteOrganizationMemberSchema
>;
export type InviteOrganizationMemberActionState =
  RefreshableActionState<InviteOrganizationMemberValues>;

type CancelOrganizationInvitationValues = z.infer<typeof invitationIdSchema>;
export type CancelOrganizationInvitationActionState =
  RefreshableActionState<CancelOrganizationInvitationValues>;

type ResendOrganizationInvitationValues = z.infer<typeof invitationIdSchema>;
export type ResendOrganizationInvitationActionState =
  RefreshableActionState<ResendOrganizationInvitationValues>;

type RemoveOrganizationMemberValues = z.infer<
  typeof removeOrganizationMemberSchema
>;
export type RemoveOrganizationMemberActionState =
  RefreshableActionState<RemoveOrganizationMemberValues>;

export const inviteOrganizationMemberAction = validatedOrganizationOwnerAction<
  typeof inviteOrganizationMemberSchema,
  { refreshKey?: number }
>(
  inviteOrganizationMemberSchema,
  async ({ email, role }, _, { organizationId }) => {
    const entitlements = await getCurrentOrganizationEntitlements();

    if (!entitlements) {
      return { error: "Unable to determine organization plan" };
    }

    try {
      assertCapability(entitlements, "team.invite");

      const requestHeaders = await headers();
      const [members, invitations] = await Promise.all([
        auth.api.listMembers({
          query: { organizationId },
          headers: requestHeaders,
        }),
        auth.api.listInvitations({
          query: { organizationId },
          headers: requestHeaders,
        }),
      ]);

      const memberCount = members?.members.length ?? 0;
      const pendingCount = (invitations ?? []).filter(
        (invitation: { status: string }) => invitation.status === "pending",
      ).length;

      assertLimit(entitlements, "teamMembers", memberCount + pendingCount);
    } catch (error) {
      if (
        error instanceof UpgradeRequiredError ||
        error instanceof LimitReachedError
      ) {
        return { error: error.message };
      }

      throw error;
    }

    try {
      await inviteOrganizationMember({
        organizationId,
        email,
        role,
      });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to send invitation",
      };
    }

    return { success: "Invitation sent successfully", refreshKey: Date.now() };
  },
);

export const cancelOrganizationInvitationAction =
  validatedOrganizationOwnerAction<
    typeof invitationIdSchema,
    { refreshKey?: number }
  >(invitationIdSchema, async ({ invitationId }) => {
    try {
      await cancelOrganizationInvitation({ invitationId });
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel invitation",
      };
    }

    return {
      success: "Invitation canceled",
      refreshKey: Date.now(),
    };
  });

export const resendOrganizationInvitationAction =
  validatedOrganizationOwnerAction<
    typeof invitationIdSchema,
    { refreshKey?: number }
  >(invitationIdSchema, async ({ invitationId }, _, { organizationId }) => {
    const result = await resendOrganizationInvitation({
      invitationId,
      organizationId,
    });

    if (result.error) {
      return result;
    }

    return { ...result, refreshKey: Date.now() };
  });

export const removeOrganizationMemberAction = validatedOrganizationOwnerAction<
  typeof removeOrganizationMemberSchema,
  { refreshKey?: number }
>(
  removeOrganizationMemberSchema,
  async ({ memberId }, _, { organizationId }) => {
    try {
      await auth.api.removeMember({
        headers: await headers(),
        body: {
          memberIdOrEmail: memberId,
          organizationId,
        },
      });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to remove member",
      };
    }

    return {
      success: "Organization member removed successfully",
      refreshKey: Date.now(),
    };
  },
);
