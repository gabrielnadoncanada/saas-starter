import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { parseAdminUsersTableSearchParams } from "@/features/admin/admin-users-table-search-params";
import { AdminUsersTable } from "@/features/admin/components/users-table";
import { getAdminUsersPage } from "@/features/admin/server/get-admin-users-page";
import { requireAdmin } from "@/features/auth/server/require-admin";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const currentUser = await requireAdmin();
  const params = parseAdminUsersTableSearchParams(await searchParams);
  const page = await getAdminUsersPage(params);

  return (
    <Page>
      <PageHeader eyebrow="Admin · Users">
        <PageTitle>Users</PageTitle>
        <PageDescription>
          Manage platform users, roles, and access.
        </PageDescription>
      </PageHeader>

      <AdminUsersTable
        currentUserId={currentUser.id}
        usersPage={{ ...params, ...page }}
      />
    </Page>
  );
}
