-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- Every ad that has gone live keeps its original date as its publish date
UPDATE "Property" SET "publishedAt" = "createdAt" WHERE "status" <> 'DRAFT';

-- CreateIndex
CREATE INDEX "Property_publishedAt_idx" ON "Property"("publishedAt");
