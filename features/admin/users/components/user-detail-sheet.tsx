"use client";

import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  CircleUser,
  Copy,
  Mail,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import type { AdminUser, UserSession } from "../users.types";

type UserDetailSheetProps = {
  currentUserId: string;
  loadingDetail: boolean;
  onImpersonate: (userId: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  onRevokeAllSessions: (userId: string) => void;
  open: boolean;
  selectedUser: AdminUser | null;
  sessions: UserSession[];
  copyToClipboard: (value: string) => void;
};

export function UserDetailSheet({
  currentUserId,
  loadingDetail,
  onImpersonate,
  onOpenChange,
  onRevokeAllSessions,
  open,
  selectedUser,
  sessions,
  copyToClipboard,
}: UserDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {selectedUser ? (
          <>
            <SheetHeader>
              <SheetTitle>User Details</SheetTitle>
              <SheetDescription>
                Comprehensive information about this user
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage
                    src={selectedUser.image ?? undefined}
                    alt={selectedUser.name ?? selectedUser.email}
                  />
                  <AvatarFallback className="text-lg">
                    {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedUser.name || "No name"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {selectedUser.id !== currentUserId ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onImpersonate(selectedUser.id)}
                >
                  <UserCheck className="size-4" />
                  Impersonate User
                </Button>
              ) : null}

              <Card>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      {selectedUser.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/15">
                          Active
                        </Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Role</span>
                      <Badge variant="secondary">
                        {selectedUser.role ?? "user"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Verified</span>
                      {selectedUser.emailVerified ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="mb-3 font-semibold">Account Information</h3>
                <Card>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 size-4 text-muted-foreground" />
                        <DetailValue
                          label="Email"
                          value={selectedUser.email}
                          onCopy={() => copyToClipboard(selectedUser.email)}
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <CircleUser className="mt-0.5 size-4 text-muted-foreground" />
                        <DetailValue
                          label="User ID"
                          value={selectedUser.id}
                          mono
                          onCopy={() => copyToClipboard(selectedUser.id)}
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Created
                          </p>
                          <span className="text-sm">
                            {format(
                              new Date(selectedUser.createdAt),
                              "MMMM d, yyyy",
                            )}
                          </span>
                        </div>
                      </div>

                      {selectedUser.updatedAt ? (
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-0.5 size-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Last Updated
                            </p>
                            <span className="text-sm">
                              {format(
                                new Date(selectedUser.updatedAt),
                                "MMMM d, yyyy",
                              )}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Active Sessions</h3>
                  {sessions.length > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRevokeAllSessions(selectedUser.id)}
                    >
                      <X className="size-3" />
                      Revoke All
                    </Button>
                  ) : null}
                </div>
                <Card>
                  <CardContent>
                    {loadingDetail ? (
                      <p className="text-sm text-muted-foreground">
                        Loading sessions...
                      </p>
                    ) : sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active sessions
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {sessions.length} active session
                        {sessions.length === 1 ? "" : "s"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailValue({
  label,
  mono = false,
  onCopy,
  value,
}: {
  label: string;
  mono?: boolean;
  onCopy: () => void;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
        <Button variant="ghost" size="icon" className="size-5" onClick={onCopy}>
          <Copy className="size-3" />
        </Button>
      </div>
    </div>
  );
}
