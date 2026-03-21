"use server";

import { headers } from "next/headers";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { inviteOrganizationMemberSchema } from "@/features/teams/schemas/organization.schema";
import {
  requireOrganizationRole,
  isOrganizationRoleError,
} from "@/features/teams/server/require-organization-role";
import { inviteOrganizationMember } from "@/features/teams/server/organization-invitations";
import { getTeamPlan } from "@/features/billing/guards/get-team-plan";
import { assertCapability, assertLimit } from "@/features/billing/guards";
import { auth } from "@/shared/lib/auth";
import { UpgradeRequiredError, LimitReachedError } from "@/features/billing/errors";

export const inviteOrganizationMemberAction = validatedActionWithUser<
  typeof inviteOrganizationMemberSchema,
  { refreshKey?: number }
>(
  inviteOrganizationMemberSchema,
  async ({ email, role }, _, user) => {
    const guard = await requireOrganizationRole(user.id, ["owner"]);

    if (isOrganizationRoleError(guard)) {
      return guard;
    }

    const teamPlan = await getTeamPlan();
    if (!teamPlan) {
      return { error: "Unable to determine team plan" };
    }

    // Check billing limits before invoking the plugin
    try {
      assertCapability(teamPlan.planId, "team.invite");

      const reqHeaders = await headers();

      const [members, invitations] = await Promise.all([
        auth.api.listMembers({
          query: { organizationId: guard.organizationId },
          headers: reqHeaders,
        }),
        auth.api.listInvitations({
          query: { organizationId: guard.organizationId },
          headers: reqHeaders,
        }),
      ]);

      const memberCount = members?.members.length ?? 0;
      const pendingCount = (invitations ?? []).filter(
        (inv: { status: string }) => inv.status === "pending",
      ).length;

      assertLimit(teamPlan.planId, "teamMembers", memberCount + pendingCount);
    } catch (error) {
      if (error instanceof UpgradeRequiredError || error instanceof LimitReachedError) {
        return { error: error.message };
      }
      throw error;
    }

    try {
      await inviteOrganizationMember({
        organizationId: guard.organizationId,
        email,
        role,
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to send invitation" };
    }

    return { success: "Invitation sent successfully", refreshKey: Date.now() };
  },
);
