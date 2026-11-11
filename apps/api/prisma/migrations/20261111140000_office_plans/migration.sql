-- Offices' own الباقات (Figma 10180:31480): bundles of regular and featured ads
-- with a validity, after which unused ads are lost (owner, 2026-11-11).

-- CreateEnum
CREATE TYPE "PlanAudience" AS ENUM ('INDIVIDUAL', 'OFFICE');

-- AlterEnum
ALTER TYPE "SlotStatus" ADD VALUE 'EXPIRED';

-- DropIndex
DROP INDEX "PlanPackage_planId_adsCount_key";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "audience" "PlanAudience" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "PlanPackage" ADD COLUMN     "featuredAdsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "featuredPlanId" TEXT,
ADD COLUMN     "validityMonths" INTEGER;

-- AlterTable
ALTER TABLE "UserPlanSlot" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PlanPackage_planId_adsCount_featuredAdsCount_key" ON "PlanPackage"("planId", "adsCount", "featuredAdsCount");

-- AddForeignKey
ALTER TABLE "PlanPackage" ADD CONSTRAINT "PlanPackage_featuredPlanId_fkey" FOREIGN KEY ("featuredPlanId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- The plans. «اعلان مميز» carries a featured ad's benefits (those of
-- الذهبية, the badge for a month); it sells nothing itself, so it isn't
-- listed. The others carry a regular ad's.
INSERT INTO "Plan" ("id", "slug", "name", "price", "features", "color", "sortOrder", "isActive", "maxActiveAds", "durationDays", "maxImagesPerAd", "featuredDays", "prioritySearch", "audience", "updatedAt") VALUES
  (gen_random_uuid()::text, 'office-featured', 'اعلان مميز', 3, ARRAY[]::text[], '#D06400', 99, true, 1, 30, 15, 30, true, 'OFFICE', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'office-basic', 'الاساسية', 2, ARRAY['مدة الاعلان 30 يوم.', 'صلاحية انتهاء الباقة شهرين.'], '#15304D', 1, true, 1, 30, 5, 0, false, 'OFFICE', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'office-regular', 'العادية', 35, ARRAY['17 اعلان عادي.', '3 اعلانات مميزة.', 'مدة الاعلان 30 يوم.', 'صلاحية انتهاء الباقة شهرين.'], '#15304D', 2, true, 1, 30, 5, 0, false, 'OFFICE', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'office-silver', 'الفضية', 70, ARRAY['44 اعلان عادي.', '6 اعلانات مميزة.', 'مدة الاعلان 30 يوم.', 'صلاحية انتهاء الباقة 6 شهور.'], '#15304D', 3, true, 1, 30, 5, 0, false, 'OFFICE', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- The packages: الاساسية is one regular (2 KD) or one featured (3 KD) ad
INSERT INTO "PlanPackage" ("id", "planId", "adsCount", "featuredAdsCount", "featuredPlanId", "validityMonths", "price", "sortOrder", "isActive", "updatedAt")
SELECT gen_random_uuid()::text, p."id", v."ads", v."featured", f."id", v."months", v."price", v."sort", true, CURRENT_TIMESTAMP
FROM (VALUES
  ('office-basic', 1, 0, 2, 2::double precision, 1),
  ('office-basic', 0, 1, 2, 3, 2),
  ('office-regular', 17, 3, 2, 35, 1),
  ('office-silver', 44, 6, 6, 70, 1)
) AS v("slug", "ads", "featured", "months", "price", "sort")
JOIN "Plan" p ON p."slug" = v."slug"
CROSS JOIN (SELECT "id" FROM "Plan" WHERE "slug" = 'office-featured') f
ON CONFLICT ("planId", "adsCount", "featuredAdsCount") DO NOTHING;
