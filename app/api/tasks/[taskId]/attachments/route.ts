import { NextResponse } from "next/server";

import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import { createNotification } from "@/features/notifications/server/notification-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import {
  createTaskAttachment,
  listTaskAttachments,
} from "@/features/tasks/server/task-attachments";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

function parseTaskId(taskId: string) {
  const value = Number(taskId);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Invalid task id");
  }

  return value;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskId } = await context.params;
    const attachments = await listTaskAttachments(parseTaskId(taskId));

    return NextResponse.json({ attachments });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load attachments" },
      { status: 400 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskId } = await context.params;
    const parsedTaskId = parseTaskId(taskId);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const membership = await requireActiveOrganizationMembership();
    const attachment = await createTaskAttachment(parsedTaskId, file, user.id);

    await Promise.all([
      recordAuditLog({
        organizationId: membership.organizationId,
        actorUserId: user.id,
        event: "task.attachment_uploaded",
        entityType: "task",
        entityId: String(parsedTaskId),
        summary: `Uploaded ${attachment.storedFile.fileName} to task ${parsedTaskId}`,
        metadata: {
          attachmentId: attachment.id,
          contentType: attachment.storedFile.contentType,
          fileName: attachment.storedFile.fileName,
          sizeBytes: attachment.storedFile.sizeBytes,
        },
      }),
      createNotification({
        organizationId: membership.organizationId,
        userId: user.id,
        type: "task.attachment_uploaded",
        title: "Task attachment uploaded",
        body: `${attachment.storedFile.fileName} was added to task ${parsedTaskId}.`,
        href: routes.app.tasks,
        metadata: {
          attachmentId: attachment.id,
          taskId: parsedTaskId,
        },
      }),
    ]);

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload attachment" },
      { status: 400 },
    );
  }
}
