export type {
  AdminApiSession,
  AdminApiUser,
  GetUserResult,
  ListUsersQueryInput,
  ListUsersResult,
} from "@/shared/lib/auth/better-auth-inferred-types";

export type { AdminApiSession as UserSession, AdminApiUser as AdminUser } from "@/shared/lib/auth/better-auth-inferred-types";

/** Filters passed from UI → `listAdminUsers` (defaults applied server-side). */
export type ListAdminUsersQuery = Partial<
  import("@/shared/lib/auth/better-auth-inferred-types").ListUsersQueryInput
>;
