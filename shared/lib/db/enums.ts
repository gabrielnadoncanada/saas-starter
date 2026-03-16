/**
 * Re-exports Prisma-generated enums so feature code never imports
 * directly from the Prisma client path. If Prisma's export surface
 * changes after an upgrade, only this file needs updating.
 */
export {
  ActivityType,
  InvitationStatus,
  PlatformRole,
  TaskLabel,
  TaskPriority,
  TaskStatus,
  TeamRole,
} from "@prisma/client";
