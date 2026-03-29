"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useAcceptOrganizationInvitation } from "@/features/organizations/data/accept-organization-invitation";
import { useOrganizationInvitation } from "@/features/organizations/data/organization-invitation-query";
import { useRejectOrganizationInvitation } from "@/features/organizations/data/reject-organization-invitation";
import { routes } from "@/shared/constants/routes";

type OrganizationInvitationPageProps = {
  invitationId: string;
};

export function OrganizationInvitationPage({
  invitationId,
}: OrganizationInvitationPageProps) {
  const router = useRouter();
  const invitation = useOrganizationInvitation(invitationId);
  const acceptInvitation = useAcceptOrganizationInvitation();
  const rejectInvitation = useRejectOrganizationInvitation();

  useToastMessage(acceptInvitation.error, { kind: "error" });
  useToastMessage(rejectInvitation.error, { kind: "error" });

  async function handleAccept() {
    await acceptInvitation.mutate({ invitationId });
    router.replace(routes.app.dashboard);
  }

  async function handleReject() {
    await rejectInvitation.mutate({ invitationId });
    router.replace(routes.app.dashboard);
  }

  if (invitation.isPending) {
    return <InvitationShell title="Loading invitation" description="Checking invitation details..." />;
  }

  if (!invitation.data || invitation.error) {
    return (
      <InvitationShell
        title="Invitation unavailable"
        description="This invitation is invalid, expired, or no longer accessible."
        icon={<AlertCircle className="h-8 w-8 text-destructive" />}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ask the sender to issue a new invitation if you still need access.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href={routes.app.dashboard}>Go to dashboard</Link>
          </Button>
        </div>
      </InvitationShell>
    );
  }

  if (invitation.data.status === "accepted") {
    return (
      <InvitationShell
        title="Invitation accepted"
        description={`You're already a member of ${invitation.data.organizationName}.`}
        icon={<CheckCircle2 className="h-8 w-8 text-green-600" />}
      >
        <Button asChild className="w-full">
          <Link href={routes.app.dashboard}>Open dashboard</Link>
        </Button>
      </InvitationShell>
    );
  }

  if (invitation.data.status === "rejected") {
    return (
      <InvitationShell
        title="Invitation declined"
        description={`You already declined the invitation to ${invitation.data.organizationName}.`}
        icon={<XCircle className="h-8 w-8 text-destructive" />}
      >
        <Button asChild variant="outline" className="w-full">
          <Link href={routes.app.dashboard}>Go to dashboard</Link>
        </Button>
      </InvitationShell>
    );
  }

  return (
    <InvitationShell
      title="Organization invitation"
      description={`Join ${invitation.data.organizationName} as ${invitation.data.role}.`}
    >
      <div className="space-y-4">
        <div className="rounded-lg border p-4 text-sm">
          <p>
            <strong>{invitation.data.inviterEmail}</strong> invited you to join{" "}
            <strong>{invitation.data.organizationName}</strong>.
          </p>
          <p className="mt-2 text-muted-foreground">
            This invitation was sent to <strong>{invitation.data.email}</strong>.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={rejectInvitation.isPending || acceptInvitation.isPending}
            onClick={() => {
              void handleReject();
            }}
          >
            {rejectInvitation.isPending ? "Declining..." : "Decline"}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={acceptInvitation.isPending || rejectInvitation.isPending}
            onClick={() => {
              void handleAccept();
            }}
          >
            {acceptInvitation.isPending ? "Accepting..." : "Accept invitation"}
          </Button>
        </div>
      </div>
    </InvitationShell>
  );
}

function InvitationShell({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          {icon ? <div>{icon}</div> : null}
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        {children ? <CardContent>{children}</CardContent> : null}
        {!children ? <CardFooter /> : null}
      </Card>
    </div>
  );
}


