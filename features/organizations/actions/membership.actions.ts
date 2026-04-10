"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { logActivity } from "@/features/activity/server/log-activity";
import { assertCapability, assertLimit } from "@/features/billing/plans";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import {
  invitationIdSchema,
  inviteOrganizationMemberSchema,
  removeOrganizationMemberSchema,
} from "@/features/organizations/schemas/organization.schema";
import {
  cancelOrganizationInvitation,
  inviteOrganizationMember,
  resendOrganizationInvitation,
} from "@/features/organizations/server/organization-invitations";
import { requireActiveOrganizationRole } from "@/features/organizations/server/organizations";
import { auth } from "@/shared/lib/auth/auth-config";
import {
  validatedAuthenticatedAction,
  withBillingErrors,
} from "@/shared/lib/auth/authenticated-action";
import type { FormActionState } from "@/shared/types/form-action-state";

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

export const inviteOrganizationMemberAction = validatedAuthenticatedAction<
  typeof inviteOrganizationMemberSchema,
  { refreshKey?: number }
>(inviteOrganizationMemberSchema, async ({ email, role }, _formData, user) => {
  return withBillingErrors(async () => {
    const { organizationId } = await requireActiveOrganizationRole(["owner"]);

    const entitlements = await getCurrentOrganizationEntitlements();
    if (!entitlements) {
      return { error: "Unable to determine organization plan" };
    }

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

    try {
      await inviteOrganizationMember({ organizationId, email, role });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to send invitation",
      };
    }

    await logActivity({
      action: "member.invited",
      organizationId,
      actorUserId: user.id,
      targetType: "invitation",
      metadata: { email, role },
    });

    return { success: "Invitation sent successfully", refreshKey: Date.now() };
  });
});

export const cancelOrganizationInvitationAction = validatedAuthenticatedAction<
  typeof invitationIdSchema,
  { refreshKey?: number }
>(invitationIdSchema, async ({ invitationId }, _formData, user) => {
  return withBillingErrors(async () => {
    const { organizationId } = await requireActiveOrganizationRole(["owner"]);

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

    await logActivity({
      action: "invitation.cancelled",
      organizationId,
      actorUserId: user.id,
      targetType: "invitation",
      targetId: invitationId,
    });

    return { success: "Invitation canceled", refreshKey: Date.now() };
  });
});

export const resendOrganizationInvitationAction = validatedAuthenticatedAction<
  typeof invitationIdSchema,
  { refreshKey?: number }
>(invitationIdSchema, async ({ invitationId }, _formData, user) => {
  return withBillingErrors(async () => {
    const { organizationId } = await requireActiveOrganizationRole(["owner"]);

    const result = await resendOrganizationInvitation({
      invitationId,
      organizationId,
    });

    if (result.error) {
      return result;
    }

    await logActivity({
      action: "invitation.resent",
      organizationId,
      actorUserId: user.id,
      targetType: "invitation",
      targetId: invitationId,
    });

    return { ...result, refreshKey: Date.now() };
  });
});

export const removeOrganizationMemberAction = validatedAuthenticatedAction<
  typeof removeOrganizationMemberSchema,
  { refreshKey?: number }
>(removeOrganizationMemberSchema, async ({ memberId }, _formData, user) => {
  return withBillingErrors(async () => {
    const { organizationId } = await requireActiveOrganizationRole(["owner"]);

    try {
      await auth.api.removeMember({
        headers: await headers(),
        body: { memberIdOrEmail: memberId, organizationId },
      });
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to remove member",
      };
    }

    await logActivity({
      action: "member.removed",
      organizationId,
      actorUserId: user.id,
      targetType: "member",
      targetId: memberId,
    });

    return {
      success: "Organization member removed successfully",
      refreshKey: Date.now(),
    };
  });
});
