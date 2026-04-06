import type { ListUsersQueryInput } from "@/shared/lib/auth/better-auth-inferred-types";

export type ListAdminUsersQuery = Partial<ListUsersQueryInput>;

export type {
  GetUserResult,
  ListUsersQueryInput,
  ListUsersResult,
} from "@/shared/lib/auth/better-auth-inferred-types";

export type { AdminApiSession as UserSession, AdminApiUser as AdminUser } from "@/shared/lib/auth/better-auth-inferred-types";
