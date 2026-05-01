import { NextResponse } from "next/server";

import { syncEmailAccount } from "@/features/email-agent/server/sync-inbox";
import { db } from "@/lib/db/prisma";
import { runAsAdmin, runInTenantScope } from "@/lib/db/tenant-scope";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ACCOUNTS_PER_RUN = 50;

async function authorize(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  // Allow Vercel Cron requests without a custom secret if it isn't configured.
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await runAsAdmin(() =>
    db.emailAccount.findMany({
      where: { status: "ACTIVE" },
      orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
      take: MAX_ACCOUNTS_PER_RUN,
    }),
  );

  const reports: Array<{
    accountId: string;
    organizationId: string;
    email: string;
    newMessages: number;
    newDrafts: number;
    autoSent: number;
    errors: string[];
  }> = [];

  for (const account of accounts) {
    try {
      const report = await runInTenantScope(account.organizationId, () =>
        syncEmailAccount(account),
      );
      reports.push({
        accountId: account.id,
        organizationId: account.organizationId,
        email: report.accountEmail,
        newMessages: report.newMessages,
        newDrafts: report.newDrafts,
        autoSent: report.autoSent,
        errors: report.errors,
      });
    } catch (error) {
      reports.push({
        accountId: account.id,
        organizationId: account.organizationId,
        email: account.email,
        newMessages: 0,
        newDrafts: 0,
        autoSent: 0,
        errors: [error instanceof Error ? error.message : "sync_failed"],
      });
    }
  }

  return NextResponse.json({
    syncedAt: new Date().toISOString(),
    accounts: reports.length,
    reports,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
