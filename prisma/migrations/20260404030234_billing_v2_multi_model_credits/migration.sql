-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "itemType" VARCHAR(20) NOT NULL,
    "itemKey" VARCHAR(100) NOT NULL,
    "componentKey" VARCHAR(100) NOT NULL DEFAULT 'default',
    "stripeSubscriptionItemId" TEXT,
    "stripePriceId" VARCHAR(255) NOT NULL,
    "billingInterval" VARCHAR(20),
    "quantity" INTEGER,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "purchaseType" VARCHAR(30) NOT NULL,
    "itemKey" VARCHAR(100) NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'usd',
    "status" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditGrant" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sourceType" VARCHAR(30) NOT NULL,
    "sourceKey" VARCHAR(100) NOT NULL,
    "creditsGranted" INTEGER NOT NULL,
    "creditsRemaining" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedgerEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "grantId" TEXT,
    "delta" INTEGER NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "referenceType" VARCHAR(50),
    "referenceId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionItem_stripeSubscriptionItemId_key" ON "SubscriptionItem"("stripeSubscriptionItemId");

-- CreateIndex
CREATE INDEX "SubscriptionItem_subscriptionId_idx" ON "SubscriptionItem"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionItem_itemType_itemKey_idx" ON "SubscriptionItem"("itemType", "itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionItem_subscriptionId_itemType_itemKey_componentK_key" ON "SubscriptionItem"("subscriptionId", "itemType", "itemKey", "componentKey");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key" ON "Purchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripePaymentIntentId_key" ON "Purchase"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Purchase_organizationId_purchaseType_itemKey_idx" ON "Purchase"("organizationId", "purchaseType", "itemKey");

-- CreateIndex
CREATE INDEX "CreditGrant_organizationId_expiresAt_idx" ON "CreditGrant"("organizationId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreditGrant_organizationId_sourceType_sourceKey_key" ON "CreditGrant"("organizationId", "sourceType", "sourceKey");

-- CreateIndex
CREATE INDEX "CreditLedgerEntry_organizationId_createdAt_idx" ON "CreditLedgerEntry"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditLedgerEntry_referenceType_referenceId_idx" ON "CreditLedgerEntry"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditGrant" ADD CONSTRAINT "CreditGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "CreditGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill primary subscription items for existing subscriptions
INSERT INTO "SubscriptionItem" (
    "id",
    "subscriptionId",
    "itemType",
    "itemKey",
    "componentKey",
    "stripePriceId",
    "billingInterval",
    "quantity",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'backfill_subscription_item_' || s."id",
    s."id",
    'plan',
    s."plan",
    'base',
    COALESCE(s."stripeSubscriptionId", 'backfill:' || s."plan" || ':' || COALESCE(s."billingInterval", 'month')),
    s."billingInterval",
    COALESCE(s."seats", 1),
    CASE
        WHEN s."status" IN ('active', 'trialing', 'past_due', 'incomplete', 'unpaid', 'paused') THEN 'active'
        ELSE 'canceled'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Subscription" s
WHERE NOT EXISTS (
    SELECT 1
    FROM "SubscriptionItem" si
    WHERE si."subscriptionId" = s."id"
      AND si."itemType" = 'plan'
);

-- Backfill subscription-cycle credits for currently active paid subscriptions
INSERT INTO "CreditGrant" (
    "id",
    "organizationId",
    "sourceType",
    "sourceKey",
    "creditsGranted",
    "creditsRemaining",
    "expiresAt",
    "createdAt",
    "updatedAt"
)
SELECT
    'backfill_credit_grant_' || s."id",
    s."referenceId",
    'subscription_cycle',
    'backfill:' || s."id" || ':' || COALESCE(TO_CHAR(s."periodStart", 'YYYY-MM-DD"T"HH24:MI:SS.MS'), 'current'),
    CASE
        WHEN s."plan" = 'team' THEN 5000
        WHEN s."plan" = 'pro' THEN 1000
        ELSE 0
    END,
    CASE
        WHEN s."plan" = 'team' THEN 5000
        WHEN s."plan" = 'pro' THEN 1000
        ELSE 0
    END,
    s."periodEnd",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Subscription" s
WHERE s."status" IN ('active', 'trialing')
  AND s."plan" IN ('pro', 'team')
  AND NOT EXISTS (
      SELECT 1
      FROM "CreditGrant" cg
      WHERE cg."organizationId" = s."referenceId"
        AND cg."sourceType" = 'subscription_cycle'
        AND cg."sourceKey" = 'backfill:' || s."id" || ':' || COALESCE(TO_CHAR(s."periodStart", 'YYYY-MM-DD"T"HH24:MI:SS.MS'), 'current')
  );

-- Backfill ledger entries for subscription-cycle grants created above
INSERT INTO "CreditLedgerEntry" (
    "id",
    "organizationId",
    "grantId",
    "delta",
    "reason",
    "referenceType",
    "referenceId",
    "createdAt"
)
SELECT
    'backfill_credit_ledger_' || cg."id",
    cg."organizationId",
    cg."id",
    cg."creditsGranted",
    'subscription_cycle_credit_grant',
    'migration',
    '20260404030234_billing_v2_multi_model_credits',
    CURRENT_TIMESTAMP
FROM "CreditGrant" cg
WHERE cg."sourceType" = 'subscription_cycle'
  AND cg."sourceKey" LIKE 'backfill:%'
  AND NOT EXISTS (
      SELECT 1
      FROM "CreditLedgerEntry" cle
      WHERE cle."id" = 'backfill_credit_ledger_' || cg."id"
  );
