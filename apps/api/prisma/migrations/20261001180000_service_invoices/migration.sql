-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_INVOICE';

-- AlterTable
ALTER TABLE "CompanyInvoice" ADD COLUMN "clientDeletedAt" TIMESTAMP(3),
ADD COLUMN "clientIdentityId" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "requestId" TEXT;

-- CreateIndex
CREATE INDEX "CompanyInvoice_clientIdentityId_idx" ON "CompanyInvoice"("clientIdentityId");

-- AddForeignKey
ALTER TABLE "CompanyInvoice" ADD CONSTRAINT "CompanyInvoice_clientIdentityId_fkey" FOREIGN KEY ("clientIdentityId") REFERENCES "Identity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvoice" ADD CONSTRAINT "CompanyInvoice_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CompanyRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
