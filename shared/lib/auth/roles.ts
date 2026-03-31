export function parseRoles(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  const roles = values.flatMap((item) =>
    typeof item === "string" ? item.split(",") : [],
  );

  return [...new Set(roles.map((role) => role.trim()).filter(Boolean))];
}

export function hasRole(value: unknown, role: string): boolean {
  return parseRoles(value).includes(role);
}

export function hasAnyRole(
  value: unknown,
  roles: readonly string[],
): boolean {
  const parsedRoles = parseRoles(value);

  return roles.some((role) => parsedRoles.includes(role));
}

export function getPrimaryRole<TRole extends string>(
  value: unknown,
  priorities: readonly TRole[],
  fallback: TRole,
): TRole {
  const parsedRoles = parseRoles(value);

  return priorities.find((role) => parsedRoles.includes(role)) ?? fallback;
}

export const PLATFORM_ADMIN_ROLES = ["admin"] as const;

export function isPlatformAdmin(value: unknown): boolean {
  return hasAnyRole(value, PLATFORM_ADMIN_ROLES);
}
