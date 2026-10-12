-- AlterEnum
ALTER TYPE "PropertyCategory" ADD VALUE 'FARM';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN "whatsappNumber" TEXT,
ADD COLUMN "allocationStatus" TEXT;
