export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | Date | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type UserSession = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type ListAdminUsersQuery = {
  limit?: number;
  offset?: number;
  searchValue?: string;
  searchField?: "email" | "name";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};
