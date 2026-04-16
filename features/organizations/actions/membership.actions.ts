"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  assertCapability,
  assertLimit,
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/entitlements";
import { getCurrentEntitlements } from "@/features/billing/server/organization-entitlements";
import {
  invitationIdSchema,
  inviteOrganizationMemberSchema,
  removeOrganizationMemberSchema,
} from "@/features/organizations/organization.schema";
import {
  cancelOrganizationInvitation,
  inviteOrganizationMember,
  resendOrganizationInvitation,
} from "@/features/organizations/server/organization-invitations";
import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organizations";
import { logActivity } from "@/lib/activity/log-activity";
import { auth } from "@/lib/auth/auth-config";
import { validatedAuthenticatedAction } from "@/lib/auth/authenticated-action";
import { isInvitationPending } from "@/lib/db/enums";
import { enforceActionRateLimit } from "@/lib/rate-limit";
import type { FormActionState } from "@/types/form-action-state";

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

function membershipActionError(error: unknown) {
  if (error instanceof OrganizationMembershipError) {
    return { error: error.message };
  }

  if (error instanceof UpgradeRequiredError) {
    return { error: error.message, errorCode: "UPGRADE_REQUIRED" as const };
  }

  if (error instanceof LimitReachedError) {
    return { error: error.message, errorCode: "LIMIT_REACHED" as const };
  }

  return null;
}

export const inviteOrganizationMemberAction = validatedAuthenticatedAction(
  inviteOrganizationMemberSchema,
  async (
    { email, role },
    { user },
  ): Promise<InviteOrganizationMemberActionState> => {
    try {
      const limited = await enforceActionRateLimit("action");
      if (limited) return limited;

      const membership = await requireActiveOrganizationRole(["owner"]);
      const organizationId = membership.organizationId;
      const entitlements = await getCurrentEntitlements();
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
        (invitation: { status: string }) => isInvitationPending(invitation.status),
      ).length;

      assertLimit(entitlements, "teamMembers", memberCount + pendingCount);

      await inviteOrganizationMember({ organizationId, email, role });
      await logActivity({
        action: "member.invited",
        organizationId,
        actorUserId: user.id,
        targetType: "invitation",
        metadata: { email, role },
      });

      return {
        success: "Invitation sent successfully",
        refreshKey: Date.now(),
      };
    } catch (error) {
      const mapped = membershipActionError(error);
      if (mapped) {
        return mapped;
      }

      return {
        error:
          error instanceof Error ? error.message : "Failed to send invitation",
      };
    }
  },
);

export const cancelOrganizationInvitationAction = validatedAuthenticatedAction(
  invitationIdSchema,
  async (
    { invitationId },
    { user },
  ): Promise<CancelOrganizationInvitationActionState> => {
    try {
      const membership = await requireActiveOrganizationRole(["owner"]);
      const organizationId = membership.organizationId;
      await cancelOrganizationInvitation({ invitationId });

      await logActivity({
        action: "invitation.cancelled",
        organizationId,
        actorUserId: user.id,
        targetType: "invitation",
        targetId: invitationId,
      });

      return { success: "Invitation canceled", refreshKey: Date.now() };
    } catch (error) {
      const mapped = membershipActionError(error);
      if (mapped) {
        return mapped;
      }

      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel invitation",
      };
    }
  },
);

export const resendOrganizationInvitationAction = validatedAuthenticatedAction(
  invitationIdSchema,
  async (
    { invitationId },
    { user },
  ): Promise<ResendOrganizationInvitationActionState> => {
    try {
      const limited = await enforceActionRateLimit("action");
      if (limited) return limited;

      const membership = await requireActiveOrganizationRole(["owner"]);
      const organizationId = membership.organizationId;
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
    } catch (error) {
      const mapped = membershipActionError(error);
      if (mapped) {
        return mapped;
      }

      throw error;
    }
  },
);

export const removeOrganizationMemberAction = validatedAuthenticatedAction(
  removeOrganizationMemberSchema,
  async (
    { memberId },
    { user },
  ): Promise<RemoveOrganizationMemberActionState> => {
    try {
      const membership = await requireActiveOrganizationRole(["owner"]);
      const organizationId = membership.organizationId;
      await auth.api.removeMember({
        headers: await headers(),
        body: { memberIdOrEmail: memberId, organizationId },
      });
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
    } catch (error) {
      const mapped = membershipActionError(error);
      if (mapped) {
        return mapped;
      }

      return {
        error:
          error instanceof Error ? error.message : "Failed to remove member",
      };
    }
  },
);
