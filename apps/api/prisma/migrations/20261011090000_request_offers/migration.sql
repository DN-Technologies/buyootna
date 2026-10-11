-- CreateEnum
CREATE TYPE "RequestOfferStatus" AS ENUM ('SENT', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "RequestOffer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "providerIdentityId" TEXT NOT NULL,
    "message" TEXT,
    "notes" TEXT,
    "price" DOUBLE PRECISION,
    "status" "RequestOfferStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestOffer_requestId_idx" ON "RequestOffer"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestOffer_requestId_providerIdentityId_key" ON "RequestOffer"("requestId", "providerIdentityId");

-- AddForeignKey
ALTER TABLE "RequestOffer" ADD CONSTRAINT "RequestOffer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CompanyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestOffer" ADD CONSTRAINT "RequestOffer_providerIdentityId_fkey" FOREIGN KEY ("providerIdentityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
