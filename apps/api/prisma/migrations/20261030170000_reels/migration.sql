-- Reels: companies and offices post short public videos, shown until deleted.
-- New table only; nothing existing changes.
-- CreateEnum
CREATE TYPE "ReelStatus" AS ENUM ('PENDING', 'ACTIVE', 'DELETED', 'FAILED');

-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "status" "ReelStatus" NOT NULL DEFAULT 'PENDING',
    "mediaKey" TEXT NOT NULL,
    "mediaContentType" TEXT NOT NULL,
    "mediaSizeBytes" INTEGER NOT NULL,
    "posterKey" TEXT NOT NULL,
    "posterSizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "caption" VARCHAR(200),
    "propertyId" TEXT,
    "hadListing" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadExpiresAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "mediaDeletedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "Reel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reel_mediaKey_key" ON "Reel"("mediaKey");

-- CreateIndex
CREATE UNIQUE INDEX "Reel_posterKey_key" ON "Reel"("posterKey");

-- CreateIndex
CREATE INDEX "Reel_status_publishedAt_id_idx" ON "Reel"("status", "publishedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Reel_identityId_status_publishedAt_idx" ON "Reel"("identityId", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Reel_identityId_publishedAt_idx" ON "Reel"("identityId", "publishedAt");

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

