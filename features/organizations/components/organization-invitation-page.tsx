"use client";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

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
import { useRouter } from "@/shared/i18n/navigation";
import { authClient } from "@/shared/lib/auth/auth-client";

type OrganizationInvitationPageProps = {
  invitationId: string;
};

type OrganizationInvitation = Awaited<
  ReturnType<typeof authClient.organization.getInvitation>
>["data"];

export function OrganizationInvitationPage({
  invitationId,
}: OrganizationInvitationPageProps) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<OrganizationInvitation>(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadInvitation() {
      try {
        setIsLoadingInvitation(true);

        const { data, error } = await authClient.organization.getInvitation({
          query: { id: invitationId },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!ignore) {
          setInvitation(data ?? null);
        }
      } catch {
        if (!ignore) {
          setInvitation(null);
        }
      } finally {
        if (!ignore) {
          setIsLoadingInvitation(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      ignore = true;
    };
  }, [invitationId]);

  async function acceptInvitation() {
    try {
      setIsAccepting(true);

      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.replace(routes.app.dashboard);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation",
      );
    } finally {
      setIsAccepting(false);
    }
  }

  async function rejectInvitation() {
    try {
      setIsRejecting(true);

      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.replace(routes.app.dashboard);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to decline invitation",
      );
    } finally {
      setIsRejecting(false);
    }
  }

  if (isLoadingInvitation) {
    return (
      <InvitationCard
        title="Loading invitation"
        description="Checking invitation details..."
      />
    );
  }

  if (!invitation) {
    return (
      <InvitationCard
        title="Invitation unavailable"
        description="This invitation is invalid, expired, or no longer accessible."
        icon={<AlertCircle className="h-8 w-8 text-destructive" />}
      >
        <p className="text-sm text-muted-foreground">
          Ask the sender to issue a new invitation if you still need access.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href={routes.app.dashboard}>Go to dashboard</Link>
        </Button>
      </InvitationCard>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <InvitationCard
        title="Invitation accepted"
        description={`You're already a member of ${invitation.organizationName}.`}
        icon={<CheckCircle2 className="h-8 w-8 text-green-600" />}
      >
        <Button asChild className="w-full">
          <Link href={routes.app.dashboard}>Open dashboard</Link>
        </Button>
      </InvitationCard>
    );
  }

  if (invitation.status === "rejected") {
    return (
      <InvitationCard
        title="Invitation declined"
        description={`You already declined the invitation to ${invitation.organizationName}.`}
        icon={<XCircle className="h-8 w-8 text-destructive" />}
      >
        <Button asChild variant="outline" className="w-full">
          <Link href={routes.app.dashboard}>Go to dashboard</Link>
        </Button>
      </InvitationCard>
    );
  }

  const isSubmitting = isAccepting || isRejecting;

  return (
    <InvitationCard
      title="Organization invitation"
      description={`Join ${invitation.organizationName} as ${invitation.role}.`}
    >
      <div className="rounded-lg border p-4 text-sm">
        <p>
          <strong>{invitation.inviterEmail}</strong> invited you to join{" "}
          <strong>{invitation.organizationName}</strong>.
        </p>
        <p className="mt-2 text-muted-foreground">
          This invitation was sent to <strong>{invitation.email}</strong>.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
          onClick={() => {
            void rejectInvitation();
          }}
        >
          {isRejecting ? "Declining..." : "Decline"}
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={isSubmitting}
          onClick={() => {
            void acceptInvitation();
          }}
        >
          {isAccepting ? "Accepting..." : "Accept invitation"}
        </Button>
      </div>
    </InvitationCard>
  );
}

type InvitationCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ReactNode;
};

function InvitationCard({
  title,
  description,
  children,
  icon,
}: InvitationCardProps) {
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
        {children ? (
          <CardContent className="space-y-4">{children}</CardContent>
        ) : null}
      </Card>
    </div>
  );
}


