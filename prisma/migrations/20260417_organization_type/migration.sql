-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PERSONAL', 'TEAM');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "type" "OrganizationType" NOT NULL DEFAULT 'TEAM';
