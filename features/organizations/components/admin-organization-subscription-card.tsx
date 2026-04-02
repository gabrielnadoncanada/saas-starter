"use client";

import { format } from "date-fns";

import type { OrgSubscription } from "@/features/organizations/types/admin-organizations.types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

type AdminOrganizationSubscriptionCardProps = {
  loading: boolean;
  subscription: OrgSubscription;
};

export function AdminOrganizationSubscriptionCard({
  loading,
  subscription,
}: AdminOrganizationSubscriptionCardProps) {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : subscription ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{subscription.plan}</span>
              <Badge variant="secondary">{subscription.status}</Badge>
            </div>

            {subscription.periodEnd ? (
              <p className="text-sm text-muted-foreground">
                Renews {format(new Date(subscription.periodEnd), "MMMM d, yyyy")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active subscription
          </p>
        )}
      </CardContent>
    </Card>
  );
}
