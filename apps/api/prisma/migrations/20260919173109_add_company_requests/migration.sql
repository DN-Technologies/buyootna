/*
  Warnings:

  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'RESPONDED', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_identityId_fkey";

-- DropTable
DROP TABLE "Alert";

-- DropEnum
DROP TYPE "AlertType";

-- CreateTable
CREATE TABLE "CompanyRequest" (
    "id" TEXT NOT NULL,
    "clientIdentityId" TEXT NOT NULL,
    "targetIdentityId" TEXT,
    "acceptedByIdentityId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "priceRange" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "offerType" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyRequest_targetIdentityId_idx" ON "CompanyRequest"("targetIdentityId");

-- CreateIndex
CREATE INDEX "CompanyRequest_clientIdentityId_idx" ON "CompanyRequest"("clientIdentityId");

-- CreateIndex
CREATE INDEX "CompanyRequest_status_idx" ON "CompanyRequest"("status");

-- AddForeignKey
ALTER TABLE "CompanyRequest" ADD CONSTRAINT "CompanyRequest_clientIdentityId_fkey" FOREIGN KEY ("clientIdentityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRequest" ADD CONSTRAINT "CompanyRequest_targetIdentityId_fkey" FOREIGN KEY ("targetIdentityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRequest" ADD CONSTRAINT "CompanyRequest_acceptedByIdentityId_fkey" FOREIGN KEY ("acceptedByIdentityId") REFERENCES "Identity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
