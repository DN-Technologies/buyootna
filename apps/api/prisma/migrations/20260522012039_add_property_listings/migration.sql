-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INVESTMENT');

-- AlterTable
ALTER TABLE "CompanyProfile" ALTER COLUMN "licenseActivity" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "category" "PropertyCategory" NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
