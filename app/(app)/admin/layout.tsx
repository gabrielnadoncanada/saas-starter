import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/shell/app-shell";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireAdmin } from "@/features/auth/server/require-admin";
import { getDashboardSidebarData } from "@/features/dashboard/config/dashboard-navigation";
import { hasAnyAiProvider } from "@/lib/ai/ai-providers-availability";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  await requireAdmin();

  const sidebarData = getDashboardSidebarData({
    assistantEnabled: hasAnyAiProvider(),
  });

  return (
    <AppShell
      defaultOpen={defaultOpen}
      sidebar={<AdminSidebar />}
      sidebarData={sidebarData}
    >
      {children}
    </AppShell>
  );
}
