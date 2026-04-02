import { NextResponse } from "next/server";

import { requireApiKey } from "@/features/api/server/require-api-key";
import { createTaskByOrganizationId } from "@/features/tasks/server/task-mutations";
import { createTaskSchema } from "@/features/tasks/task-form.schema";
import { db } from "@/shared/lib/db/prisma";

export async function GET(request: Request) {
  const context = await requireApiKey(request, "api.access");

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await db.task.findMany({
    where: { organizationId: context.organization.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const context = await requireApiKey(request, "task.create");

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const task = await createTaskByOrganizationId(
      context.organization.id,
      context.planId,
      parsed.data,
    );

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create task" },
      { status: 400 },
    );
  }
}
