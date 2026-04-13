import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardOnboardingChecklist } from "@/features/dashboard/components/dashboard-onboarding-checklist";

type DashboardGettingStartedCardProps = {
  items: {
    id: string;
    title: string;
    done: boolean;
    href: string;
  }[];
};

export function DashboardGettingStartedCard({
  items,
}: DashboardGettingStartedCardProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Getting started</CardTitle>
        <CardDescription>
          Use this checklist to turn the starter into a real workspace quickly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardOnboardingChecklist items={items} />
      </CardContent>
    </Card>
  );
}
