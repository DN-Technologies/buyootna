-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "assignedAdminId" TEXT;

-- CreateIndex
CREATE INDEX "Report_assignedAdminId_idx" ON "Report"("assignedAdminId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
