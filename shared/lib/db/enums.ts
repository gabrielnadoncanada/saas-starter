import { parseRoles } from "@/shared/lib/auth/roles";

export {
  PlatformRole,
  TaskLabel,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

export const ORG_ROLES = ["owner", "admin", "member"] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export function isOrgRole(value: unknown): value is OrgRole {
  return typeof value === "string" && ORG_ROLES.some((role) => role === value);
}

export function parseOrgRoles(value: unknown): OrgRole[] {
  return parseRoles(value).filter(isOrgRole);
}

export function hasOrgRole(
  value: unknown,
  role: OrgRole,
): boolean {
  const roles = Array.isArray(value) ? value : parseOrgRoles(value);
  return roles.includes(role);
}

export function hasAnyOrgRole(
  value: unknown,
  roles: readonly OrgRole[],
): boolean {
  const parsed = Array.isArray(value) ? value : parseOrgRoles(value);
  return roles.some((role) => parsed.includes(role));
}

export function getPrimaryOrgRole(
  value: unknown,
  fallback: OrgRole = "member",
): OrgRole {
  const parsed = parseOrgRoles(value);
  return ORG_ROLES.find((role) => parsed.includes(role)) ?? fallback;
}
