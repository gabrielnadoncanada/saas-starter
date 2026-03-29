import { Building2, Users, ShieldBan, ShieldCheck } from "lucide-react";
import { getAdminOverviewStats } from "@/features/admin/server/get-admin-overview-stats";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function AdminDashboardPage() {
  const stats = await getAdminOverviewStats();

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      description: "Non-banned users",
      icon: ShieldCheck,
    },
    {
      title: "Banned Users",
      value: stats.bannedUsers,
      description: "Currently banned",
      icon: ShieldBan,
    },
    {
      title: "Organizations",
      value: stats.totalOrganizations,
      description: "Total organizations",
      icon: Building2,
    },
  ];

  return (
    <Page>
      <PageHeader>
        <PageTitle>Administration</PageTitle>
        <PageDescription>
          Platform overview and user management.
        </PageDescription>
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

