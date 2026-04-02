"use server";

import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import { createNotification } from "@/features/notifications/server/notification-service";
import { z } from "zod";

const twoFactorAuditSchema = z.object({
  event: z.enum(["enabled", "disabled", "backup_codes_regenerated"]),
});

export const recordTwoFactorAuditAction = validatedAuthenticatedAction<
  typeof twoFactorAuditSchema,
  {}
>(twoFactorAuditSchema, async ({ event }, _, user) => {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return { success: "Security event recorded" };
  }

  const summaryMap = {
    enabled: "Enabled two-factor authentication",
    disabled: "Disabled two-factor authentication",
    backup_codes_regenerated: "Regenerated backup codes",
  } as const;

  const titleMap = {
    enabled: "Two-factor enabled",
    disabled: "Two-factor disabled",
    backup_codes_regenerated: "Backup codes regenerated",
  } as const;

  await Promise.all([
    recordAuditLog({
      organizationId: organization.id,
      actorUserId: user.id,
      event: `security.two_factor.${event}`,
      entityType: "user",
      entityId: user.id,
      summary: summaryMap[event],
    }),
    createNotification({
      organizationId: organization.id,
      userId: user.id,
      type: `security.two_factor.${event}`,
      title: titleMap[event],
      body: summaryMap[event],
    }),
  ]);

  return { success: "Security event recorded" };
});
