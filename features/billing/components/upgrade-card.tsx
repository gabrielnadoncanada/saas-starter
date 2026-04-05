"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

type UpgradeCardProps = {
  feature: string;
  description?: string;
};

export function UpgradeCard({ feature, description }: UpgradeCardProps) {
  const t = useTranslations("billing");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Required</CardTitle>
        <CardDescription>
          {description ?? t("upgradeCard.description", { feature })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={routes.marketing.pricing}>
          <Button>
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
