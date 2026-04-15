import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { parseAdminOrganizationsTableSearchParams } from "@/features/admin/admin-organizations-table-search-params";
import { AdminOrganizationsTable } from "@/features/admin/components/organizations-table";
import { getAdminOrganizationsPage } from "@/features/admin/server/get-admin-organizations-page";
import { requireAdmin } from "@/features/auth/server/require-admin";

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
      <PageHeader eyebrow="Admin · Organizations">
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
