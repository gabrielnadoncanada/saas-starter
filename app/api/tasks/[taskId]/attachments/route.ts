import { NextResponse } from "next/server";

import {
  createTaskAttachment,
  listTaskAttachments,
} from "@/features/tasks/server/task-attachments";
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

    const attachment = await createTaskAttachment(parsedTaskId, file, user.id);

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload attachment" },
      { status: 400 },
    );
  }
}
