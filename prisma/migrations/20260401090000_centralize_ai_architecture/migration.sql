-- Drop assistant-owned conversation storage
ALTER TABLE "AssistantConversation"
DROP CONSTRAINT "AssistantConversation_organizationId_fkey";

ALTER TABLE "AssistantConversation"
DROP CONSTRAINT "AssistantConversation_userId_fkey";

DROP TABLE "AssistantConversation";

-- Create centralized organization AI settings
CREATE TABLE "OrganizationAiSettings" (
    "organizationId" TEXT NOT NULL,
    "defaultModelId" VARCHAR(100) NOT NULL,
    "allowedModelIds" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationAiSettings_pkey" PRIMARY KEY ("organizationId")
);

-- Create centralized AI conversations
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "surface" VARCHAR(120) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "messagesJson" JSONB NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiConversation_organizationId_createdByUserId_surface_lastMessageAt_idx"
ON "AiConversation"("organizationId", "createdByUserId", "surface", "lastMessageAt" DESC);

CREATE INDEX "AiConversation_createdByUserId_idx"
ON "AiConversation"("createdByUserId");

CREATE INDEX "AiConversation_organizationId_idx"
ON "AiConversation"("organizationId");

ALTER TABLE "OrganizationAiSettings"
ADD CONSTRAINT "OrganizationAiSettings_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiConversation"
ADD CONSTRAINT "AiConversation_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiConversation"
ADD CONSTRAINT "AiConversation_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
