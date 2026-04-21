export const ACTIVITY_ACTIONS = [
  "member.invited",
  "member.removed",
  "invitation.cancelled",
  "invitation.resent",
  "subscription.created",
  "subscription.updated",
  "subscription.cancelled",
  "organization.deleted",
  "user.deleted",
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export type ActivityEventTarget = {
  type: string;
  id: string;
};

export type ActivityEventMetadata = Record<string, unknown>;

export type ActivityFeedItem = {
  id: string;
  action: ActivityAction;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  target: ActivityEventTarget | null;
  metadata: ActivityEventMetadata | null;
};
