-- Stories (phase 2): reports made from a story, and the author's viewer list.
-- Existing reports have no story (NULL), so the new unique index can't clash.
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "targetStoryId" TEXT,
ADD COLUMN     "targetStorySnapshot" JSONB;

-- CreateIndex
CREATE INDEX "Report_targetStoryId_idx" ON "Report"("targetStoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterIdentityId_targetStoryId_key" ON "Report"("reporterIdentityId", "targetStoryId");

-- CreateIndex
CREATE INDEX "StoryView_storyId_viewedAt_idx" ON "StoryView"("storyId", "viewedAt");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetStoryId_fkey" FOREIGN KEY ("targetStoryId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

