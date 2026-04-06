import type { Auth } from "@/shared/lib/auth/auth-config";

type Api = Auth["api"];

/** Admin plugin: list users response. */
export type ListUsersResult = Awaited<ReturnType<Api["listUsers"]>>;
export type AdminApiUser = ListUsersResult["users"][number];

/** Admin plugin: single user (get-user returns the user object). */
export type GetUserResult = Awaited<ReturnType<Api["getUser"]>>;

/** Admin plugin: list sessions for a user. */
export type ListUserSessionsResult = Awaited<ReturnType<Api["listUserSessions"]>>;
export type AdminApiSession = ListUserSessionsResult["sessions"][number];

/** Query object accepted by `auth.api.listUsers` (partial; server fills defaults). */
export type ListUsersQueryInput = NonNullable<Parameters<Api["listUsers"]>[0]>["query"];

/** Organization plugin: full organization payload. */
export type GetFullOrganizationResult = Awaited<
  ReturnType<Api["getFullOrganization"]>
>;
/** Runtime payloads may include billing fields (e.g. Stripe) not on the generated plugin type. */
export type FullOrganization = NonNullable<GetFullOrganizationResult> & {
  stripeCustomerId?: string | null;
};

/** Organization plugin: invitation rows from list-invitations. */
export type ListInvitationsResult = Awaited<ReturnType<Api["listInvitations"]>>;
export type OrganizationInvitationRow = ListInvitationsResult[number];
