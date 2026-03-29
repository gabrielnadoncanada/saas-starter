import { hasAnyRole } from "@/shared/lib/roles";

export const PLATFORM_ADMIN_ROLES = ["admin"] as const;

export function isPlatformAdmin(value: unknown): boolean {
  return hasAnyRole(value, PLATFORM_ADMIN_ROLES);
}
