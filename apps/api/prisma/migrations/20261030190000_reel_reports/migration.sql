-- Reports can be made from a reel, and admins can remove one. Additive.
-- AlterEnum
ALTER TYPE "AdminActionType" ADD VALUE 'REEL_REMOVED';

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "targetReelId" TEXT,
ADD COLUMN     "targetReelSnapshot" JSONB;

-- CreateIndex
CREATE INDEX "Report_targetReelId_idx" ON "Report"("targetReelId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterIdentityId_targetReelId_key" ON "Report"("reporterIdentityId", "targetReelId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetReelId_fkey" FOREIGN KEY ("targetReelId") REFERENCES "Reel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

