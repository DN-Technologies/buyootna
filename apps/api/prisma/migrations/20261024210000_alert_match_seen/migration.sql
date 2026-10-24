-- The home avatar pill shows a gold "+N" for alert matches the owner hasn't
-- opened yet. Matches from before this are marked seen, so nobody gets an
-- old backlog counted as new.
-- AlterTable
ALTER TABLE "AlertMatch" ADD COLUMN     "seenAt" TIMESTAMP(3);

UPDATE "AlertMatch" SET "seenAt" = "createdAt";

-- CreateIndex
CREATE INDEX "AlertMatch_alertId_seenAt_idx" ON "AlertMatch"("alertId", "seenAt");
