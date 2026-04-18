import { NextResponse } from "next/server";

import { db } from "@/lib/db/prisma";
import { runAsAdmin } from "@/lib/db/tenant-scope";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not in demo mode" }, { status: 404 });
  }

  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await runAsAdmin(async () => {
    await db.$transaction([
      db.activityEvent.deleteMany(),
      db.aiConversation.deleteMany(),
      db.task.deleteMany(),
      db.invitation.deleteMany(),
      db.member.deleteMany(),
      db.usageCounter.deleteMany(),
      db.subscription.deleteMany(),
      db.storedFile.deleteMany(),
      db.twoFactor.deleteMany(),
      db.organization.deleteMany(),
      db.session.deleteMany(),
      db.verification.deleteMany(),
      db.account.deleteMany(),
      db.user.deleteMany(),
    ]);

    const [{ seedAdminOrganization }, { seedDemoOrganization }] =
      await Promise.all([
        import("@/lib/db/seeds/admin-seed"),
        import("@/lib/db/seeds/demo-organization-seed"),
      ]);

    await seedAdminOrganization();
    await seedDemoOrganization();
  });

  return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
}

export async function GET(request: Request) {
  return POST(request);
}
