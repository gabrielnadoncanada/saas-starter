import { requireAdmin } from "@/features/auth/server/require-admin";
import { parseAdminUsersTableSearchParams } from "@/features/users/admin-users-table-search-params";
import { AdminUsersTable } from "@/features/users/components/admin-users-table";
import { getAdminUsersPage } from "@/features/users/server/get-admin-users-page";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

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
      <PageHeader>
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
