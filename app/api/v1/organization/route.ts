import { NextResponse } from "next/server";

import { requireApiKey } from "@/features/api/server/require-api-key";

export async function GET(request: Request) {
  const context = await requireApiKey(request, "api.access");

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    organization: {
      id: context.organization.id,
      name: context.organization.name,
      slug: context.organization.slug,
      planId: context.planId,
    },
  });
}
