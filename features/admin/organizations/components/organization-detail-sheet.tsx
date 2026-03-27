"use client";

import { format } from "date-fns";
import { Building2, Calendar, Trash2, Users } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import type {
  AdminOrganization,
  OrgSubscription,
} from "../organizations.types";

type OrganizationDetailSheetProps = {
  loadingDetail: boolean;
  onDelete: (organization: AdminOrganization) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  organization: AdminOrganization | null;
  subscription: OrgSubscription;
  isOwnOrganization: (organization: AdminOrganization) => boolean;
};

export function OrganizationDetailSheet({
  loadingDetail,
  onDelete,
  onOpenChange,
  open,
  organization,
  subscription,
  isOwnOrganization,
}: OrganizationDetailSheetProps) {
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

              <div>
                <h3 className="mb-3 font-semibold">Subscription</h3>
                <Card>
                  <CardContent>
                    {loadingDetail ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : subscription ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {subscription.plan}
                          </span>
                          <Badge variant="secondary">{subscription.status}</Badge>
                        </div>
                        {subscription.periodEnd ? (
                          <p className="text-sm text-muted-foreground">
                            Renews{" "}
                            {format(
                              new Date(subscription.periodEnd),
                              "MMMM d, yyyy",
                            )}
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
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Members</h3>
                <div className="space-y-4">
                  {organization.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.user.image ?? undefined}
                          alt={member.user.name ?? member.user.email}
                        />
                        <AvatarFallback>
                          {(member.user.name || member.user.email)[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{member.role}</Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Joined {format(new Date(member.createdAt), "MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isOwnOrganization(organization) ? (
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
