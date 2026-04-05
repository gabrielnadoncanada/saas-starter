import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/features/auth/server/require-admin";
import { AdminOrganizationsTable } from "@/features/organizations/components/admin-organizations-table";
import { listAdminOrganizations } from "@/features/organizations/server/list-admin-organizations";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";

const PAGE_SIZE = 25;

export default async function AdminOrganizationsPage() {
  const t = await getTranslations("admin");
  const currentUser = await requireAdmin();
  const { organizations, total } = await listAdminOrganizations({
    limit: PAGE_SIZE,
    offset: 0,
  });

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("organizationsPage.title")}</PageTitle>
        <PageDescription>{t("organizationsPage.description")}</PageDescription>
      </PageHeader>

      <AdminOrganizationsTable
        initialOrganizations={organizations as any}
        initialTotal={total}
        currentUserId={currentUser.id}
        pageSize={PAGE_SIZE}
      />
    </Page>
  );
}
