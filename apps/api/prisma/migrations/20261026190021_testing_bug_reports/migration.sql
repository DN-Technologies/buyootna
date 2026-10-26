-- CreateEnum
CREATE TYPE "TestingBugSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TestingBugStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'NOT_A_BUG');

-- CreateTable
CREATE TABLE "TestingBugReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "severity" "TestingBugSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "TestingBugStatus" NOT NULL DEFAULT 'NEW',
    "steps" TEXT NOT NULL,
    "expected" TEXT,
    "actual" TEXT,
    "platform" TEXT,
    "device" TEXT,
    "appVersion" TEXT,
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reporterName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestingBugReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestingBugComment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestingBugComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestingBugReport_status_createdAt_idx" ON "TestingBugReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TestingBugComment_reportId_createdAt_idx" ON "TestingBugComment"("reportId", "createdAt");

-- AddForeignKey
ALTER TABLE "TestingBugComment" ADD CONSTRAINT "TestingBugComment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "TestingBugReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
