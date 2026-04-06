"use client";

import { format } from "date-fns";
import { Building2, Calendar, Trash2, Users } from "lucide-react";

import type {
  AdminOrganization,
  OrgSubscription,
} from "@/features/admin/types/admin-organizations.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { AdminOrganizationMembersList } from "./admin-organization-members-list";
import { AdminOrganizationSubscriptionCard } from "./admin-organization-subscription-card";

type AdminOrganizationDetailSheetProps = {
  loading: boolean;
  onDelete: (organization: AdminOrganization) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  organization: AdminOrganization | null;
  subscription: OrgSubscription;
  viewerBelongsToOrganization: (organization: AdminOrganization) => boolean;
};

export function AdminOrganizationDetailSheet({
  loading,
  onDelete,
  onOpenChange,
  open,
  organization,
  subscription,
  viewerBelongsToOrganization,
}: AdminOrganizationDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {organization ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                  <Building2 className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <SheetTitle>{organization.name}</SheetTitle>
                  <SheetDescription>{organization.slug}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 overflow-y-auto">
              <Card>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="size-4 text-muted-foreground" />
                      {organization._count.members} member
                      {organization._count.members === 1 ? "" : "s"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-muted-foreground" />
                      Created{" "}
                      {format(new Date(organization.createdAt), "MMMM d, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-semibold">Subscription</h3>
                <AdminOrganizationSubscriptionCard
                  loading={loading}
                  subscription={subscription}
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Members</h3>
                <AdminOrganizationMembersList members={organization.members} />
              </div>

              {!viewerBelongsToOrganization(organization) ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => onDelete(organization)}
                >
                  <Trash2 className="size-4" />
                  Delete Organization
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
