/**
 * Re-exports Prisma-generated enums so feature code never imports
 * directly from the generated client path. If the generated path
 * changes after a Prisma upgrade, only this file needs updating.
 */
export {
  ActivityType,
  InvitationStatus,
  PlatformRole,
  TaskLabel,
  TaskPriority,
  TaskStatus,
  TeamRole,
} from "@/shared/lib/db/generated/client/enums";
