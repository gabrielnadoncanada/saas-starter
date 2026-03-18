-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN "token" VARCHAR(36),
ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill existing rows with a UUID token
UPDATE "Invitation" SET "token" = gen_random_uuid()::VARCHAR(36) WHERE "token" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "Invitation" ALTER COLUMN "token" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
