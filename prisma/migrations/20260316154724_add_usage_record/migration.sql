-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "limitKey" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageRecord_teamId_limitKey_createdAt_idx" ON "UsageRecord"("teamId", "limitKey", "createdAt");

-- CreateIndex
CREATE INDEX "UsageRecord_teamId_limitKey_idx" ON "UsageRecord"("teamId", "limitKey");

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
