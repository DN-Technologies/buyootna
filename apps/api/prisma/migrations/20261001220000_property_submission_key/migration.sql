-- AlterTable
ALTER TABLE "Property" ADD COLUMN "submissionKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Property_identityId_submissionKey_key" ON "Property"("identityId", "submissionKey");
