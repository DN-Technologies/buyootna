-- CreateTable
CREATE TABLE "FeaturePackage" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "durationDays" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturePackage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "featureDays" INTEGER,
ADD COLUMN     "featurePackageId" TEXT,
ADD COLUMN     "propertyId" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_featurePackageId_fkey" FOREIGN KEY ("featurePackageId") REFERENCES "FeaturePackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the packages the app has shown so far, so every environment gets
-- them from `migrate deploy` (production never runs the seed script)
INSERT INTO "FeaturePackage" ("id", "label", "description", "durationDays", "price", "sortOrder", "updatedAt") VALUES
    ('feature-day',   'تمييز ليوم',    'تعزيز سريع للإعلان.',   1,  1, 1, CURRENT_TIMESTAMP),
    ('feature-week',  'تمييز لاسبوع',  'ظهور أقوى لمدة أطول.',  7,  3, 2, CURRENT_TIMESTAMP),
    ('feature-month', 'تمييز لشهر',    'أفضل انتشار لإعلانك.',  30, 5, 3, CURRENT_TIMESTAMP);
