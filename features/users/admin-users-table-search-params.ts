import {
  createLoader,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

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

export const adminUsersTableSearchParams = {
  page: parseAsInteger
    .withDefault(ADMIN_USERS_TABLE_DEFAULTS.page)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(ADMIN_USERS_TABLE_DEFAULTS.pageSize)
    .withOptions({ clearOnDefault: true }),
  q: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sort: parseAsStringLiteral(ADMIN_USERS_TABLE_SORT_FIELDS)
    .withDefault(ADMIN_USERS_TABLE_DEFAULTS.sort)
    .withOptions({ clearOnDefault: true }),
  order: parseAsStringLiteral(["asc", "desc"] as const)
    .withDefault(ADMIN_USERS_TABLE_DEFAULTS.order)
    .withOptions({ clearOnDefault: true }),
};

export const loadAdminUsersTableSearchParams = createLoader(
  adminUsersTableSearchParams,
);
export const serializeAdminUsersTableHref = createSerializer(
  adminUsersTableSearchParams,
);

export type AdminUsersTableSearchParams = Awaited<
  ReturnType<typeof loadAdminUsersTableSearchParams>
>;

export function parseAdminUsersTableSearchParams(
  input: Record<string, string | string[] | undefined>,
): AdminUsersTableSearchParams {
  const parsed = loadAdminUsersTableSearchParams(input);
  return {
    ...parsed,
    page: Math.max(1, parsed.page),
    pageSize: ADMIN_USERS_TABLE_PAGE_SIZES.includes(
      parsed.pageSize as (typeof ADMIN_USERS_TABLE_PAGE_SIZES)[number],
    )
      ? parsed.pageSize
      : ADMIN_USERS_TABLE_DEFAULTS.pageSize,
  };
}

export function buildAdminUsersTableHref(
  pathname: string,
  params: AdminUsersTableSearchParams,
) {
  return serializeAdminUsersTableHref(pathname, params);
}
