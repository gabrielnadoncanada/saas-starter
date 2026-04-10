import { AdminUsersTable } from "@/features/admin/components/users-table";
import { listAdminUsers } from "@/features/admin/server/users";
import { requireAdmin } from "@/features/auth/server/require-admin";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

const PAGE_SIZE = 25;

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const result = await listAdminUsers({
    limit: PAGE_SIZE,
    offset: 0,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  return (
    <Page>
      <PageHeader>
        <PageTitle>Users</PageTitle>
        <PageDescription>
          Manage platform users, roles, and access.
        </PageDescription>
      </PageHeader>

      <AdminUsersTable
        currentUserId={currentUser.id}
        initialTotal={result.total}
        initialUsers={result.users}
        pageSize={PAGE_SIZE}
      />
    </Page>
  );
}
