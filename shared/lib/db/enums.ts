/**
 * Re-exports Prisma-generated enums so feature code never imports
 * directly from the Prisma client path. If Prisma's export surface
 * changes after an upgrade, only this file needs updating.
 */
export {
  PlatformRole,
  TaskLabel,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

/**
 * Organization member roles used by the better-auth organization plugin.
 * These are stored as plain strings in the database, not Prisma enums.
 */
export const ORG_ROLES = ["owner", "admin", "member"] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export function isOrgRole(value: unknown): value is OrgRole {
  return typeof value === "string" && ORG_ROLES.some((role) => role === value);
}

export function toOrgRole(
  value: unknown,
  fallback: OrgRole = "member",
): OrgRole {
  return isOrgRole(value) ? value : fallback;
}
