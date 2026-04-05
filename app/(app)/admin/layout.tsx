import { cookies } from "next/headers";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireAdmin } from "@/features/auth/server/require-admin";
import { AppShell } from "@/shared/components/layout/shell/app-shell";
import { UserProvider } from "@/shared/components/providers/user-provider";
import { toSidebarUser } from "@/shared/lib/auth/get-current-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const user = await requireAdmin();

  return (
    <UserProvider user={toSidebarUser(user)}>
      <AppShell defaultOpen={defaultOpen} sidebar={<AdminSidebar />}>
        {children}
      </AppShell>
    </UserProvider>
  );
}
