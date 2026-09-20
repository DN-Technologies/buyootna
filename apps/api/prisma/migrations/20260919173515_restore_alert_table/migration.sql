-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PROPERTIES', 'AUCTIONS');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "operationType" "ListingType",
    "governorateId" TEXT NOT NULL,
    "areaId" TEXT,
    "categoryId" TEXT,
    "price" DOUBLE PRECISION,
    "rentValue" DOUBLE PRECISION,
    "areaSize" DOUBLE PRECISION,
    "rooms" INTEGER,
    "baths" INTEGER,
    "floors" INTEGER,
    "requestYear" INTEGER,
    "requiredYear" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_identityId_idx" ON "Alert"("identityId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
