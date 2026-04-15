"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { OrgSubscription } from "@/features/admin/types/organizations.types";
import { formatLongDate } from "@/lib/date/format-date";

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
                Renews {formatLongDate(subscription.periodEnd)}
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
