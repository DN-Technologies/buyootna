-- Reels: who viewed and who liked. New tables only; nothing existing changes.
-- CreateTable
CREATE TABLE "ReelView" (
    "reelId" TEXT NOT NULL,
    "viewerIdentityId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReelView_pkey" PRIMARY KEY ("reelId","viewerIdentityId")
);

-- CreateTable
CREATE TABLE "ReelLike" (
    "reelId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReelLike_pkey" PRIMARY KEY ("reelId","identityId")
);

-- CreateIndex
CREATE INDEX "ReelView_viewerIdentityId_reelId_idx" ON "ReelView"("viewerIdentityId", "reelId");

-- CreateIndex
CREATE INDEX "ReelView_viewedAt_idx" ON "ReelView"("viewedAt");

-- CreateIndex
CREATE INDEX "ReelLike_identityId_idx" ON "ReelLike"("identityId");

-- AddForeignKey
ALTER TABLE "ReelView" ADD CONSTRAINT "ReelView_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelView" ADD CONSTRAINT "ReelView_viewerIdentityId_fkey" FOREIGN KEY ("viewerIdentityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelLike" ADD CONSTRAINT "ReelLike_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelLike" ADD CONSTRAINT "ReelLike_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

