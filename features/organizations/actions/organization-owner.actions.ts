"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";
import { getCurrentOrganizationPlan } from "@/features/billing/plans/get-current-organization-plan";
import {
  assertCapability,
  assertLimit,
} from "@/features/billing/guards/plan-guards";
import {
  createNotification,
  createNotificationsForUsers,
} from "@/features/notifications/server/notification-service";
import { validatedOrganizationOwnerAction } from "@/features/organizations/actions/validated-organization-owner.action";
import {
  invitationIdSchema,
  inviteOrganizationMemberSchema,
  removeOrganizationMemberSchema,
} from "@/features/organizations/schemas/membership.schema";
import { renameOrganizationSchema } from "@/features/organizations/schemas/organization.schema";
import {
  cancelOrganizationInvitation,
  inviteOrganizationMember,
  resendOrganizationInvitation,
} from "@/features/organizations/server/organization-invitations";
import { auth } from "@/shared/lib/auth/auth-config";
import type { RefreshableFormState } from "@/features/organizations/types/membership.types";
type InviteOrganizationMemberValues = z.infer<
  typeof inviteOrganizationMemberSchema
>;
export type InviteOrganizationMemberActionState =
  RefreshableFormState<InviteOrganizationMemberValues>;

type CancelOrganizationInvitationValues = z.infer<typeof invitationIdSchema>;
export type CancelOrganizationInvitationActionState =
  RefreshableFormState<CancelOrganizationInvitationValues>;

type ResendOrganizationInvitationValues = z.infer<typeof invitationIdSchema>;
export type ResendOrganizationInvitationActionState =
  RefreshableFormState<ResendOrganizationInvitationValues>;

type RemoveOrganizationMemberValues = z.infer<
  typeof removeOrganizationMemberSchema
>;
export type RemoveOrganizationMemberActionState =
  RefreshableFormState<RemoveOrganizationMemberValues>;
export const renameOrganizationAction = validatedOrganizationOwnerAction<
  typeof renameOrganizationSchema,
  { refreshKey?: number }
>(renameOrganizationSchema, async ({ name }, _, { organizationId, user }) => {
  try {
    await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId,
        data: { name },
      },
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to rename organization",
      };
  }

  await createNotification({
    organizationId,
    userId: user.id,
    type: "organization.renamed",
    title: "Organization renamed",
    body: `Workspace name updated to ${name}.`,
  });
  await recordAuditLog({
    organizationId,
    actorUserId: user.id,
    event: "organization.renamed",
    entityType: "organization",
    entityId: organizationId,
    summary: `Renamed workspace to ${name}`,
  });

  return {
    success: "Organization renamed successfully",
    refreshKey: Date.now(),
  };
});

export const inviteOrganizationMemberAction = validatedOrganizationOwnerAction<
  typeof inviteOrganizationMemberSchema,
  { refreshKey?: number }
>(
  inviteOrganizationMemberSchema,
  async ({ email, role }, _, { organizationId, user }) => {
    const organizationPlan = await getCurrentOrganizationPlan();

    if (!organizationPlan) {
      return { error: "Unable to determine organization plan" };
    }

    try {
      assertCapability(organizationPlan.planId, "team.invite");

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

      assertLimit(
        organizationPlan.planId,
        "teamMembers",
        memberCount + pendingCount,
      );
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

    const requestHeaders = await headers();
    const members = await auth.api.listMembers({
      query: { organizationId },
      headers: requestHeaders,
    });

    await Promise.all([
      recordAuditLog({
        organizationId,
        actorUserId: user.id,
        event: "organization.invitation_sent",
        entityType: "invitation",
        summary: `Invited ${email} as ${role}`,
      }),
      createNotificationsForUsers(
        organizationId,
        (members?.members ?? []).map((member: { userId: string }) => member.userId),
        {
          type: "organization.invitation_sent",
          title: "New invitation sent",
          body: `${email} was invited to join the workspace.`,
        },
      ),
    ]);

    return { success: "Invitation sent successfully", refreshKey: Date.now() };
  },
);

export const cancelOrganizationInvitationAction =
  validatedOrganizationOwnerAction<
    typeof invitationIdSchema,
    { refreshKey?: number }
  >(invitationIdSchema, async ({ invitationId }, _, { organizationId, user }) => {
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

    await recordAuditLog({
      organizationId,
      actorUserId: user.id,
      event: "organization.invitation_canceled",
      entityType: "invitation",
      entityId: invitationId,
      summary: "Canceled an invitation",
    });

    return {
      success: "Invitation canceled",
      refreshKey: Date.now(),
    };
  });

export const resendOrganizationInvitationAction =
  validatedOrganizationOwnerAction<
    typeof invitationIdSchema,
    { refreshKey?: number }
  >(invitationIdSchema, async ({ invitationId }, _, { organizationId, user }) => {
    const result = await resendOrganizationInvitation({
      invitationId,
      organizationId,
    });

    if (result.error) {
      return result;
    }

    await recordAuditLog({
      organizationId,
      actorUserId: user.id,
      event: "organization.invitation_resent",
      entityType: "invitation",
      entityId: invitationId,
      summary: "Resent an invitation",
    });

    return { ...result, refreshKey: Date.now() };
  });

export const removeOrganizationMemberAction = validatedOrganizationOwnerAction<
  typeof removeOrganizationMemberSchema,
  { refreshKey?: number }
>(
  removeOrganizationMemberSchema,
  async ({ memberId }, _, { organizationId, user }) => {
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

    await recordAuditLog({
      organizationId,
      actorUserId: user.id,
      event: "organization.member_removed",
      entityType: "member",
      entityId: memberId,
      summary: "Removed a workspace member",
    });

    return {
      success: "Organization member removed successfully",
      refreshKey: Date.now(),
    };
  },
);
