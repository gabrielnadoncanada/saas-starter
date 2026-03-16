-- Remove unused ActivityType enum values: SUPER_ADMIN_SIGN_IN, IMPERSONATE_USER, STOP_IMPERSONATION
-- PostgreSQL doesn't support ALTER TYPE ... DROP VALUE, so we recreate the enum.

-- Delete any rows that reference the values being removed
DELETE FROM "ActivityLog" WHERE "action" IN ('SUPER_ADMIN_SIGN_IN', 'IMPERSONATE_USER', 'STOP_IMPERSONATION');

-- Rename old enum
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";

-- Create new enum without the removed values
CREATE TYPE "ActivityType" AS ENUM ('SIGN_UP', 'SIGN_IN', 'DELETE_ACCOUNT', 'UPDATE_ACCOUNT', 'CREATE_TEAM', 'REMOVE_TEAM_MEMBER', 'INVITE_TEAM_MEMBER', 'ACCEPT_INVITATION', 'LINK_AUTH_PROVIDER', 'UNLINK_AUTH_PROVIDER');

-- Swap the column type
ALTER TABLE "ActivityLog" ALTER COLUMN "action" TYPE "ActivityType" USING "action"::text::"ActivityType";

-- Drop the old enum
DROP TYPE "ActivityType_old";
