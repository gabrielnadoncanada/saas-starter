import { formatDistanceToNow } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  LogOut,
  Mail,
  MailX,
  Send,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  ActivityAction,
  ActivityFeedItem,
} from "@/lib/activity/activity.types";

const ACTION_DEFINITIONS: Record<
  ActivityAction,
  { label: string; icon: LucideIcon }
> = {
  "member.invited": { label: "invited a new member", icon: UserPlus },
  "member.removed": { label: "removed a member", icon: UserMinus },
  "invitation.cancelled": { label: "cancelled an invitation", icon: MailX },
  "invitation.resent": { label: "resent an invitation", icon: Send },
  "subscription.created": {
    label: "started a subscription",
    icon: CreditCard,
  },
  "subscription.cancelled": {
    label: "cancelled a subscription",
    icon: CreditCard,
  },
  "organization.deleted": { label: "deleted the organization", icon: Trash2 },
  "user.deleted": { label: "deleted their account", icon: LogOut },
};

function getInitials(name: string | null, email: string | null) {
  const source = name ?? email ?? "";
  const parts = source.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ActorAvatar({ actor }: { actor: ActivityFeedItem["actor"] }) {
  if (!actor) {
    return (
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="text-xs">
          <Mail className="h-3.5 w-3.5" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className="h-8 w-8 border">
      {actor.image ? (
        <AvatarImage src={actor.image} alt={actor.name ?? actor.email ?? ""} />
      ) : null}
      <AvatarFallback className="text-xs">
        {getInitials(actor.name, actor.email)}
      </AvatarFallback>
    </Avatar>
  );
}

function formatTargetMetadata(item: ActivityFeedItem) {
  const parts: string[] = [];

  if (item.metadata && typeof item.metadata === "object") {
    const email = item.metadata["email"];
    const role = item.metadata["role"];
    const plan = item.metadata["planId"];
    if (typeof email === "string") parts.push(email);
    if (typeof role === "string") parts.push(`role: ${role}`);
    if (typeof plan === "string") parts.push(`plan: ${plan}`);
  }

  if (item.target?.id && parts.length === 0) {
    parts.push(`${item.target.type}:${item.target.id}`);
  }

  return parts.join(" · ");
}

export function ActivityFeed({ events }: { events: ActivityFeedItem[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No activity yet</EmptyTitle>
              <EmptyDescription>
                Invitations, member changes, and billing events will appear
                here as they happen.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="divide-y">
          {events.map((event) => {
            const definition = ACTION_DEFINITIONS[event.action] ?? {
              label: event.action,
              icon: Mail,
            };
            const Icon = definition.icon;
            const actorName =
              event.actor?.name ?? event.actor?.email ?? "A system event";
            const details = formatTargetMetadata(event);

            return (
              <li
                key={event.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <ActorAvatar actor={event.actor} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">
                      {actorName}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {definition.label}
                    </span>
                  </p>
                  {details ? (
                    <p className="text-xs text-muted-foreground">{details}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <Icon className="mt-1 h-4 w-4 text-muted-foreground" />
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
