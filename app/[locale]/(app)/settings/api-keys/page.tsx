import { getTranslations } from "next-intl/server";
import { ApiKeysPanel } from "@/features/api-keys/components/api-keys-panel";
import { listOrganizationApiKeys } from "@/features/api-keys/server/api-key-service";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { routes } from "@/shared/constants/routes";
import { getPlan } from "@/shared/config/billing.config";
import { redirectToLocale } from "@/shared/i18n/href";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export default async function ApiKeysSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, user, organizationPlan] = await Promise.all([
    params,
    getCurrentUser(),
    getOrganizationPlan(),
  ]);
  const t = await getTranslations("settings.apiKeys");

  if (!user || !organizationPlan) {
    redirectToLocale(locale, routes.auth.login);
  }

  const [apiKeys, plan] = await Promise.all([
    listOrganizationApiKeys(organizationPlan.organizationId),
    Promise.resolve(getPlan(organizationPlan.planId)),
  ]);

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("title")}</PageTitle>
        <PageDescription>{t("description")}</PageDescription>
      </PageHeader>

      <ApiKeysPanel
        apiKeys={apiKeys}
        availableCapabilities={plan.capabilities.filter(
          (capability) => capability !== "billing.portal",
        )}
      />
    </Page>
  );
}
