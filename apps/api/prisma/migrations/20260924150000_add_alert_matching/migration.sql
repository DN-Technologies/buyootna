-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ALERT_MATCH';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastMatchedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AlertMatch" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertMatch_propertyId_idx" ON "AlertMatch"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertMatch_alertId_propertyId_key" ON "AlertMatch"("alertId", "propertyId");

-- CreateIndex
CREATE INDEX "Alert_isActive_type_governorateId_idx" ON "Alert"("isActive", "type", "governorateId");

-- AddForeignKey
ALTER TABLE "AlertMatch" ADD CONSTRAINT "AlertMatch_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertMatch" ADD CONSTRAINT "AlertMatch_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

