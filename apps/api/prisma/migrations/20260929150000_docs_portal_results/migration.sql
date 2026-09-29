-- Docs portal test tracking: releases, append-only story results, comments
-- CreateEnum
CREATE TYPE "DocsReleaseStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "DocsResultStatus" AS ENUM ('PASS', 'FAIL', 'BLOCKED', 'NOT_RUN', 'READY_FOR_RETEST');

-- CreateEnum
CREATE TYPE "DocsCommentKind" AS ENUM ('COMMENT', 'DESIGN_MISMATCH');

-- CreateTable
CREATE TABLE "DocsRelease" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT,
    "notes" TEXT,
    "status" "DocsReleaseStatus" NOT NULL DEFAULT 'OPEN',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "DocsRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocsStoryResult" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "status" "DocsResultStatus" NOT NULL,
    "note" TEXT,
    "bugUrl" TEXT,
    "attachments" TEXT[],
    "authorName" TEXT NOT NULL,
    "authorRole" "DocsRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocsStoryResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocsComment" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "releaseId" TEXT,
    "kind" "DocsCommentKind" NOT NULL DEFAULT 'COMMENT',
    "body" TEXT NOT NULL,
    "attachments" TEXT[],
    "authorName" TEXT NOT NULL,
    "authorRole" "DocsRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocsComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocsRelease_status_createdAt_idx" ON "DocsRelease"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DocsStoryResult_releaseId_storyId_createdAt_idx" ON "DocsStoryResult"("releaseId", "storyId", "createdAt");

-- CreateIndex
CREATE INDEX "DocsComment_storyId_createdAt_idx" ON "DocsComment"("storyId", "createdAt");

-- AddForeignKey
ALTER TABLE "DocsStoryResult" ADD CONSTRAINT "DocsStoryResult_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "DocsRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocsComment" ADD CONSTRAINT "DocsComment_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "DocsRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

