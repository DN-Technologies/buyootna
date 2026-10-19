-- Stories (phase 1): companies and offices post photos shown for 24 hours.
-- New tables only; nothing existing changes.
-- CreateEnum
CREATE TYPE "StoryMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('PENDING', 'ACTIVE', 'DELETED', 'FAILED');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'PENDING',
    "mediaType" "StoryMediaType" NOT NULL,
    "mediaKey" TEXT NOT NULL,
    "mediaContentType" TEXT NOT NULL,
    "mediaSizeBytes" INTEGER NOT NULL,
    "posterKey" TEXT,
    "posterSizeBytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "caption" VARCHAR(200),
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "mediaDeletedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryView" (
    "storyId" TEXT NOT NULL,
    "viewerIdentityId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryView_pkey" PRIMARY KEY ("storyId","viewerIdentityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_mediaKey_key" ON "Story"("mediaKey");

-- CreateIndex
CREATE UNIQUE INDEX "Story_posterKey_key" ON "Story"("posterKey");

-- CreateIndex
CREATE INDEX "Story_status_expiresAt_idx" ON "Story"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Story_identityId_status_expiresAt_idx" ON "Story"("identityId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "StoryView_viewerIdentityId_idx" ON "StoryView"("viewerIdentityId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_viewerIdentityId_fkey" FOREIGN KEY ("viewerIdentityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

