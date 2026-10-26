-- CreateEnum
CREATE TYPE "TestingCredentialKind" AS ENUM ('LOGIN', 'DANGER');

-- CreateTable
CREATE TABLE "TestingCredential" (
    "kind" "TestingCredentialKind" NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestingCredential_pkey" PRIMARY KEY ("kind")
);

-- CreateTable
CREATE TABLE "TestingAuditLog" (
    "id" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppVersionSeen" (
    "platform" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppVersionSeen_pkey" PRIMARY KEY ("platform","appVersion","runtime")
);

-- CreateIndex
CREATE INDEX "TestingAuditLog_createdAt_idx" ON "TestingAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "TestingAuditLog_action_idx" ON "TestingAuditLog"("action");

-- CreateIndex
CREATE INDEX "AppVersionSeen_lastSeenAt_idx" ON "AppVersionSeen"("lastSeenAt");
