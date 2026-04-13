import { requireAdmin } from "@/features/auth/server/require-admin";
import { parseAdminOrganizationsTableSearchParams } from "@/features/organizations/admin-organizations-table-search-params";
import { AdminOrganizationsTable } from "@/features/organizations/components/admin-organizations-table";
import { getAdminOrganizationsPage } from "@/features/organizations/server/get-admin-organizations-page";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

type AdminOrganizationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOrganizationsPage({
  searchParams,
}: AdminOrganizationsPageProps) {
  const currentUser = await requireAdmin();
  const params = parseAdminOrganizationsTableSearchParams(await searchParams);
  const page = await getAdminOrganizationsPage(params);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Organizations</PageTitle>
        <PageDescription>
          View and manage all platform organizations.
        </PageDescription>
      </PageHeader>

      <AdminOrganizationsTable
        currentUserId={currentUser.id}
        organizationsPage={{ ...params, ...page }}
      />
    </Page>
  );
}
