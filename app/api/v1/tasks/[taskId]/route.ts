import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiKey } from "@/features/api/server/require-api-key";
import { db } from "@/shared/lib/db/prisma";

const updateTaskApiSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  label: z.enum(["FEATURE", "BUG", "DOCUMENTATION"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE", "CANCELED"])
    .optional(),
});

type TaskRouteProps = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(request: Request, { params }: TaskRouteProps) {
  const context = await requireApiKey(request, "api.access");

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const parsed = updateTaskApiSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const task = await db.task.updateMany({
    where: {
      id: Number(taskId),
      organizationId: context.organization.id,
    },
    data: parsed.data,
  });

  if (task.count === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updatedTask = await db.task.findFirst({
    where: {
      id: Number(taskId),
      organizationId: context.organization.id,
    },
  });

  return NextResponse.json({ task: updatedTask });
}

export async function DELETE(request: Request, { params }: TaskRouteProps) {
  const context = await requireApiKey(request, "api.access");

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const result = await db.task.deleteMany({
    where: {
      id: Number(taskId),
      organizationId: context.organization.id,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
