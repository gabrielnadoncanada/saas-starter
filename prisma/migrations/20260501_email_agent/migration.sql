-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "EmailAccountStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "EmailMessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "AgentDraftStatus" AS ENUM ('PENDING', 'APPROVED', 'SENT', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "EmailAccount" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "connectedByUserId" TEXT NOT NULL,
    "provider" "EmailProvider" NOT NULL DEFAULT 'GOOGLE',
    "email" VARCHAR(255) NOT NULL,
    "status" "EmailAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "historyId" VARCHAR(40),
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "autoSendEnabled" BOOLEAN NOT NULL DEFAULT false,
    "agentInstructions" TEXT,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailThread" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "emailAccountId" TEXT NOT NULL,
    "providerThreadId" VARCHAR(120) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "snippet" TEXT,
    "participants" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "hasPendingDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "emailAccountId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "providerMessageId" VARCHAR(120) NOT NULL,
    "direction" "EmailMessageDirection" NOT NULL,
    "fromAddress" VARCHAR(320) NOT NULL,
    "toAddresses" TEXT NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "bodyText" TEXT NOT NULL,
    "internalDate" TIMESTAMP(3) NOT NULL,
    "inReplyTo" VARCHAR(320),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDraft" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "emailAccountId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "replyToMessageId" TEXT,
    "subject" VARCHAR(500) NOT NULL,
    "bodyText" TEXT NOT NULL,
    "status" "AgentDraftStatus" NOT NULL DEFAULT 'PENDING',
    "modelId" VARCHAR(80) NOT NULL,
    "reasoning" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentMessageId" VARCHAR(120),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailAccount_organizationId_idx" ON "EmailAccount"("organizationId");

-- CreateIndex
CREATE INDEX "EmailAccount_connectedByUserId_idx" ON "EmailAccount"("connectedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAccount_organizationId_email_key" ON "EmailAccount"("organizationId", "email");

-- CreateIndex
CREATE INDEX "EmailThread_organizationId_lastMessageAt_idx" ON "EmailThread"("organizationId", "lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "EmailThread_emailAccountId_lastMessageAt_idx" ON "EmailThread"("emailAccountId", "lastMessageAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "EmailThread_emailAccountId_providerThreadId_key" ON "EmailThread"("emailAccountId", "providerThreadId");

-- CreateIndex
CREATE INDEX "EmailMessage_threadId_internalDate_idx" ON "EmailMessage"("threadId", "internalDate");

-- CreateIndex
CREATE INDEX "EmailMessage_organizationId_idx" ON "EmailMessage"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_emailAccountId_providerMessageId_key" ON "EmailMessage"("emailAccountId", "providerMessageId");

-- CreateIndex
CREATE INDEX "AgentDraft_organizationId_status_createdAt_idx" ON "AgentDraft"("organizationId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AgentDraft_threadId_idx" ON "AgentDraft"("threadId");

-- CreateIndex
CREATE INDEX "AgentDraft_emailAccountId_status_idx" ON "AgentDraft"("emailAccountId", "status");

-- AddForeignKey
ALTER TABLE "EmailAccount" ADD CONSTRAINT "EmailAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAccount" ADD CONSTRAINT "EmailAccount_connectedByUserId_fkey" FOREIGN KEY ("connectedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "EmailThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDraft" ADD CONSTRAINT "AgentDraft_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "EmailThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
