import { NextResponse } from "next/server";

import { removeTaskAttachment } from "@/features/tasks/server/task-attachments";
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
    await removeTaskAttachment(attachmentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to remove attachment" },
      { status: 400 },
    );
  }
}
