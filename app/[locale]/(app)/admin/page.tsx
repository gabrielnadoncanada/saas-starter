import { Building2, ShieldBan, ShieldCheck, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getAdminOverviewStats } from "@/features/admin/server/get-admin-overview-stats";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const stats = await getAdminOverviewStats();

  const cards = [
    {
      title: t("totalUsers"),
      value: stats.totalUsers,
      description: t("totalUsersDesc"),
      icon: Users,
    },
    {
      title: t("activeUsers"),
      value: stats.activeUsers,
      description: t("activeUsersDesc"),
      icon: ShieldCheck,
    },
    {
      title: t("bannedUsers"),
      value: stats.bannedUsers,
      description: t("bannedUsersDesc"),
      icon: ShieldBan,
    },
    {
      title: t("organizations"),
      value: stats.totalOrganizations,
      description: t("organizationsDesc"),
      icon: Building2,
    },
  ];

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("title")}</PageTitle>
        <PageDescription>{t("description")}</PageDescription>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <stat.icon className="size-4" />
                {stat.title}
              </CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Page>
  );
}
