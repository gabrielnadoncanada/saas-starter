import { AdminOrganizationsTable } from "@/features/admin/components/organizations-table";
import { listAdminOrganizations } from "@/features/admin/server/organizations";
import { requireAdmin } from "@/features/auth/server/require-admin";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

const PAGE_SIZE = 25;

export default async function AdminOrganizationsPage() {
  const currentUser = await requireAdmin();
  const { organizations, total } = await listAdminOrganizations({
    limit: PAGE_SIZE,
    offset: 0,
  });

  return (
    <Page>
      <PageHeader>
        <PageTitle>Organizations</PageTitle>
        <PageDescription>
          View and manage all platform organizations.
        </PageDescription>
      </PageHeader>

      <AdminOrganizationsTable
        initialOrganizations={organizations}
        initialTotal={total}
        currentUserId={currentUser.id}
        pageSize={PAGE_SIZE}
      />
    </Page>
  );
}
