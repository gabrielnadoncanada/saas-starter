import { NextResponse } from "next/server";

import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import { createNotification } from "@/features/notifications/server/notification-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import { removeTaskAttachment } from "@/features/tasks/server/task-attachments";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ attachmentId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { attachmentId } = await context.params;
    const membership = await requireActiveOrganizationMembership();
    const attachment = await removeTaskAttachment(attachmentId);

    await Promise.all([
      recordAuditLog({
        organizationId: membership.organizationId,
        actorUserId: user.id,
        event: "task.attachment_deleted",
        entityType: "task",
        entityId: String(attachment.taskId),
        summary: `Removed ${attachment.storedFile.fileName} from task ${attachment.taskId}`,
        metadata: {
          attachmentId: attachment.id,
          fileName: attachment.storedFile.fileName,
          taskId: attachment.taskId,
        },
      }),
      createNotification({
        organizationId: membership.organizationId,
        userId: user.id,
        type: "task.attachment_deleted",
        title: "Task attachment removed",
        body: `${attachment.storedFile.fileName} was removed from task ${attachment.taskId}.`,
        href: routes.app.tasks,
        metadata: {
          attachmentId: attachment.id,
          taskId: attachment.taskId,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to remove attachment" },
      { status: 400 },
    );
  }
}
