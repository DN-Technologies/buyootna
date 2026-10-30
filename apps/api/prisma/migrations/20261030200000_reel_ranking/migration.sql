-- Reels: watch data per view, and a stored score for ranking. Additive.
-- AlterTable
ALTER TABLE "Reel" ADD COLUMN     "rankScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReelView" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "watchedMs" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Reel_status_rankScore_id_idx" ON "Reel"("status", "rankScore" DESC, "id" DESC);

