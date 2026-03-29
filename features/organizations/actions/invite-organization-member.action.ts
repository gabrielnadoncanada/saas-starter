"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
import { assertCapability, assertLimit } from "@/features/billing/guards";
import { UpgradeRequiredError, LimitReachedError } from "@/features/billing/errors";
import { validatedOrganizationOwnerAction } from "@/features/organizations/actions/validated-organization-owner.action";
import { inviteOrganizationMemberSchema } from "@/features/organizations/schemas/membership.schema";
import type { RefreshableFormState } from "@/features/organizations/types/membership.types";
import { inviteOrganizationMember } from "@/features/organizations/server/organization-invitations";
import { auth } from "@/shared/lib/auth";

type InviteOrganizationMemberValues = z.infer<typeof inviteOrganizationMemberSchema>;

export type InviteOrganizationMemberActionState =
  RefreshableFormState<InviteOrganizationMemberValues>;

export const inviteOrganizationMemberAction = validatedOrganizationOwnerAction<
  typeof inviteOrganizationMemberSchema,
  { refreshKey?: number }
>(
  inviteOrganizationMemberSchema,
  async ({ email, role }, _, { organizationId }) => {
    const organizationPlan = await getOrganizationPlan();

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

      assertLimit(organizationPlan.planId, "teamMembers", memberCount + pendingCount);
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

