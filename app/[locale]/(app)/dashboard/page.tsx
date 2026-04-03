import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DashboardOverview locale={locale} />;
}
