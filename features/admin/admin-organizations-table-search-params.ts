import {
  createLoader,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const ADMIN_ORGANIZATIONS_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;
export const ADMIN_ORGANIZATIONS_TABLE_SORT_FIELDS = [
  "createdAt",
  "name",
] as const;

export const ADMIN_ORGANIZATIONS_TABLE_DEFAULTS = {
  page: 1,
  pageSize: 25,
  sort: "createdAt",
  order: "desc",
} as const;

export const adminOrganizationsTableSearchParams = {
  page: parseAsInteger
    .withDefault(ADMIN_ORGANIZATIONS_TABLE_DEFAULTS.page)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(ADMIN_ORGANIZATIONS_TABLE_DEFAULTS.pageSize)
    .withOptions({ clearOnDefault: true }),
  q: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  sort: parseAsStringLiteral(ADMIN_ORGANIZATIONS_TABLE_SORT_FIELDS)
    .withDefault(ADMIN_ORGANIZATIONS_TABLE_DEFAULTS.sort)
    .withOptions({ clearOnDefault: true }),
  order: parseAsStringLiteral(["asc", "desc"] as const)
    .withDefault(ADMIN_ORGANIZATIONS_TABLE_DEFAULTS.order)
    .withOptions({ clearOnDefault: true }),
};

export const loadAdminOrganizationsTableSearchParams = createLoader(
  adminOrganizationsTableSearchParams,
);
export const serializeAdminOrganizationsTableHref = createSerializer(
  adminOrganizationsTableSearchParams,
);

export type AdminOrganizationsTableSearchParams = Awaited<
  ReturnType<typeof loadAdminOrganizationsTableSearchParams>
>;

function isAllowedPageSize(
  value: number,
): value is (typeof ADMIN_ORGANIZATIONS_TABLE_PAGE_SIZES)[number] {
  return (ADMIN_ORGANIZATIONS_TABLE_PAGE_SIZES as readonly number[]).includes(
    value,
  );
}

export function parseAdminOrganizationsTableSearchParams(
  input: Record<string, string | string[] | undefined>,
): AdminOrganizationsTableSearchParams {
  const parsed = loadAdminOrganizationsTableSearchParams(input);
  return {
    ...parsed,
    page: Math.max(1, parsed.page),
    pageSize: isAllowedPageSize(parsed.pageSize)
      ? parsed.pageSize
      : ADMIN_ORGANIZATIONS_TABLE_DEFAULTS.pageSize,
  };
}

export function buildAdminOrganizationsTableHref(
  pathname: string,
  params: AdminOrganizationsTableSearchParams,
) {
  return serializeAdminOrganizationsTableHref(pathname, params);
}
