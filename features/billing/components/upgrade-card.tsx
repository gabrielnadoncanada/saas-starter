"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";

type UpgradeCardProps = {
  feature: string;
  description?: string;
};

export function UpgradeCard({ feature, description }: UpgradeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Required</CardTitle>
        <CardDescription>
          {description ??
            `Your current plan does not include ${feature}. Upgrade to unlock this feature.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={routes.settings.billing}>
          <Button>
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
