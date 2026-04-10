import { cookies } from "next/headers";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireAdmin } from "@/features/auth/server/require-admin";
import { AppShell } from "@/shared/components/layout/shell/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  await requireAdmin();

  return (
    <AppShell defaultOpen={defaultOpen} sidebar={<AdminSidebar />}>
      {children}
    </AppShell>
  );
}
