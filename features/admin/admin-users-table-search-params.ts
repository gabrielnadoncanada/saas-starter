import { z } from "zod";

export const ADMIN_USERS_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;
export const ADMIN_USERS_TABLE_SORT_FIELDS = [
  "createdAt",
  "email",
  "name",
] as const;

export const ADMIN_USERS_TABLE_DEFAULTS = {
  page: 1,
  pageSize: 25,
  sort: "createdAt",
  order: "desc",
} as const;

export type AdminUsersTablePageSize =
  (typeof ADMIN_USERS_TABLE_PAGE_SIZES)[number];

const adminUsersTableSearchParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .catch(ADMIN_USERS_TABLE_DEFAULTS.page),
  pageSize: z.coerce
    .number()
    .int()
    .catch(ADMIN_USERS_TABLE_DEFAULTS.pageSize)
    .transform((value) =>
      ADMIN_USERS_TABLE_PAGE_SIZES.includes(value as AdminUsersTablePageSize)
        ? (value as AdminUsersTablePageSize)
        : ADMIN_USERS_TABLE_DEFAULTS.pageSize,
    ),
  q: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || undefined),
  sort: z
    .enum(ADMIN_USERS_TABLE_SORT_FIELDS)
    .catch(ADMIN_USERS_TABLE_DEFAULTS.sort),
  order: z.enum(["asc", "desc"]).catch(ADMIN_USERS_TABLE_DEFAULTS.order),
});

export type AdminUsersTableSearchParams = z.output<
  typeof adminUsersTableSearchParamsSchema
>;

export function parseAdminUsersTableSearchParams(
  input: Record<string, string | string[] | undefined>,
): AdminUsersTableSearchParams {
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  return adminUsersTableSearchParamsSchema.parse({
    page: first(input.page),
    pageSize: first(input.pageSize),
    q: first(input.q),
    sort: first(input.sort),
    order: first(input.order),
  });
}

export function buildAdminUsersTableHref(
  pathname: string,
  params: AdminUsersTableSearchParams,
) {
  const searchParams = new URLSearchParams();

  if (params.page !== ADMIN_USERS_TABLE_DEFAULTS.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== ADMIN_USERS_TABLE_DEFAULTS.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.sort !== ADMIN_USERS_TABLE_DEFAULTS.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.order !== ADMIN_USERS_TABLE_DEFAULTS.order) {
    searchParams.set("order", params.order);
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
