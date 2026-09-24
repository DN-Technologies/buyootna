-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "planId" TEXT,
ADD COLUMN     "planPackageId" TEXT;

-- CreateTable
CREATE TABLE "PlanPackage" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "adsCount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanPackage_planId_adsCount_key" ON "PlanPackage"("planId", "adsCount");

-- AddForeignKey
ALTER TABLE "PlanPackage" ADD CONSTRAINT "PlanPackage_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_planPackageId_fkey" FOREIGN KEY ("planPackageId") REFERENCES "PlanPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Align the plan tiers with the redesigned mobile plans screen (mirrors
-- prisma/seeds/seed.ts, which production never runs). Keyed by slug, so a
-- tier missing from this database is left alone.
UPDATE "Plan" SET
    "name" = 'الاساسية',
    "price" = 10,
    "originalPrice" = NULL,
    "discountText" = NULL,
    "badge" = NULL,
    "maxActiveAds" = 1,
    "durationDays" = 30,
    "maxImagesPerAd" = 5,
    "featuredDays" = 0,
    "prioritySearch" = false,
    "features" = ARRAY['مدة النشر 30 يوم.', 'حتى 5 صورة للعقار.', 'ظهور في نتائج البحث.', 'تواصل مباشر مع المهتمين.'],
    "isActive" = true,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'regular';

UPDATE "Plan" SET
    "name" = 'الذهبية',
    "price" = 12,
    "originalPrice" = NULL,
    "discountText" = NULL,
    "badge" = 'موصى به',
    "maxActiveAds" = 1,
    "durationDays" = 30,
    "maxImagesPerAd" = 15,
    "featuredDays" = 7,
    "prioritySearch" = true,
    "features" = ARRAY['تمييز الاعلانات.', 'حتى 15 صورة للعقار.', 'مدة النشر 30 يوم.', 'ظهور في أعلى نتائج البحث.', 'اولوية الظهور في البحث الجغرافي.'],
    "isActive" = true,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'gold';

-- Silver is no longer sold; keep the row so existing slots/invoices resolve.
UPDATE "Plan" SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'silver';

-- Seed the package options shown on the mobile plans screen for the
-- existing plan tiers. Skips any tier that doesn't exist in this database.
INSERT INTO "PlanPackage" ("id", "planId", "adsCount", "price", "sortOrder", "updatedAt")
SELECT gen_random_uuid()::text, p."id", v."adsCount", v."price", v."sortOrder", CURRENT_TIMESTAMP
FROM (VALUES
    ('regular', 2, 10.0, 1),
    ('regular', 5, 22.5, 2),
    ('gold',    1, 12.0, 1),
    ('gold',    5, 50.0, 2)
) AS v("slug", "adsCount", "price", "sortOrder")
JOIN "Plan" p ON p."slug" = v."slug"
ON CONFLICT ("planId", "adsCount") DO NOTHING;
