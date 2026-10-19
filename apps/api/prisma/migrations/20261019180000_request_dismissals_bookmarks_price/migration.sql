-- Company requests (Figma «الطلبات»): a company can hide a public request
-- for itself (رفض) and save one (اضافة الى المفضلة); price range ends are
-- stored as numbers for the price filter.

-- AlterEnum: a company's reply notifies the client
ALTER TYPE "NotificationType" ADD VALUE 'REQUEST_REPLY';

-- AlterTable
ALTER TABLE "CompanyRequest" ADD COLUMN "priceMin" DOUBLE PRECISION,
ADD COLUMN "priceMax" DOUBLE PRECISION;

-- Backfill from the stored text ("200 - 800 د.ك", Arabic or Latin digits,
-- thousands commas): the first and last numbers
UPDATE "CompanyRequest"
SET "priceMin" = NULLIF(regexp_replace(translate(split_part("priceRange", '-', 1), '٠١٢٣٤٥٦٧٨٩,٬', '0123456789'), '[^0-9.]', '', 'g'), '')::DOUBLE PRECISION,
    "priceMax" = NULLIF(regexp_replace(translate(split_part("priceRange", '-', 2), '٠١٢٣٤٥٦٧٨٩,٬', '0123456789'), '[^0-9.]', '', 'g'), '')::DOUBLE PRECISION
WHERE "priceRange" IS NOT NULL AND "priceRange" LIKE '%-%';

-- CreateTable
CREATE TABLE "RequestDismissal" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestBookmark" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestDismissal_identityId_idx" ON "RequestDismissal"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestDismissal_requestId_identityId_key" ON "RequestDismissal"("requestId", "identityId");

-- CreateIndex
CREATE INDEX "RequestBookmark_identityId_idx" ON "RequestBookmark"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestBookmark_requestId_identityId_key" ON "RequestBookmark"("requestId", "identityId");

-- AddForeignKey
ALTER TABLE "RequestDismissal" ADD CONSTRAINT "RequestDismissal_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CompanyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDismissal" ADD CONSTRAINT "RequestDismissal_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestBookmark" ADD CONSTRAINT "RequestBookmark_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CompanyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestBookmark" ADD CONSTRAINT "RequestBookmark_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
