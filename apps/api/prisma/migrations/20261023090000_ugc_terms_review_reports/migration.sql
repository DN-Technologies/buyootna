-- Guideline 1.2: the terms each account agreed to, reports made from a
-- review, and the audit entries of the admin's «حذف المحتوى وإيقاف الحساب».
-- New nullable columns and enum values only; existing rows are untouched.
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminActionType" ADD VALUE 'REVIEW_DELETED';
ALTER TYPE "AdminActionType" ADD VALUE 'STORY_REMOVED';

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "targetReviewId" TEXT,
ADD COLUMN     "targetReviewSnapshot" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" TEXT;

-- CreateIndex
CREATE INDEX "Report_targetReviewId_idx" ON "Report"("targetReviewId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetReviewId_fkey" FOREIGN KEY ("targetReviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

