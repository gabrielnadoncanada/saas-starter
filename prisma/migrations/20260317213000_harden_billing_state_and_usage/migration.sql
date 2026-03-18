ALTER TABLE "Team"
ADD COLUMN "planId" VARCHAR(20);

UPDATE "Team"
SET "planId" = CASE LOWER(TRIM(COALESCE("planName", '')))
  WHEN 'base' THEN 'pro'
  WHEN 'pro' THEN 'pro'
  WHEN 'plus' THEN 'team'
  WHEN 'team' THEN 'team'
  ELSE NULL
END;

CREATE TABLE "UsageCounter" (
  "id" SERIAL NOT NULL,
  "teamId" INTEGER NOT NULL,
  "limitKey" VARCHAR(50) NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

INSERT INTO "UsageCounter" ("teamId", "limitKey", "periodStart", "count")
SELECT
  "teamId",
  "limitKey",
  date_trunc('month', "createdAt")::timestamp,
  COUNT(*)::integer
FROM "UsageRecord"
GROUP BY "teamId", "limitKey", date_trunc('month', "createdAt");

CREATE UNIQUE INDEX "UsageCounter_teamId_limitKey_periodStart_key"
ON "UsageCounter"("teamId", "limitKey", "periodStart");

CREATE INDEX "UsageCounter_teamId_limitKey_idx"
ON "UsageCounter"("teamId", "limitKey");

ALTER TABLE "UsageCounter"
ADD CONSTRAINT "UsageCounter_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProcessedStripeCheckout" (
  "id" SERIAL NOT NULL,
  "sessionId" VARCHAR(255) NOT NULL,
  "teamId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProcessedStripeCheckout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProcessedStripeCheckout_sessionId_key"
ON "ProcessedStripeCheckout"("sessionId");

CREATE INDEX "ProcessedStripeCheckout_teamId_idx"
ON "ProcessedStripeCheckout"("teamId");

ALTER TABLE "ProcessedStripeCheckout"
ADD CONSTRAINT "ProcessedStripeCheckout_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "UsageRecord";
