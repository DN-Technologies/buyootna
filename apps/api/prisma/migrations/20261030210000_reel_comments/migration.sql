-- Reels: comments, and reports and notifications for them. Additive.
-- AlterEnum
ALTER TYPE "AdminActionType" ADD VALUE 'REEL_COMMENT_REMOVED';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REEL_COMMENT';

-- AlterTable
ALTER TABLE "Reel" ADD COLUMN     "commentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commentsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "targetReelCommentId" TEXT,
ADD COLUMN     "targetReelCommentSnapshot" JSONB;

-- CreateTable
CREATE TABLE "ReelComment" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReelComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReelComment_reelId_createdAt_id_idx" ON "ReelComment"("reelId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "ReelComment_identityId_createdAt_idx" ON "ReelComment"("identityId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_targetReelCommentId_idx" ON "Report"("targetReelCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterIdentityId_targetReelCommentId_key" ON "Report"("reporterIdentityId", "targetReelCommentId");

-- AddForeignKey
ALTER TABLE "ReelComment" ADD CONSTRAINT "ReelComment_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelComment" ADD CONSTRAINT "ReelComment_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetReelCommentId_fkey" FOREIGN KEY ("targetReelCommentId") REFERENCES "ReelComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

