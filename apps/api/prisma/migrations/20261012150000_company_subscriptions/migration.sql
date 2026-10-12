-- CreateEnum
CREATE TYPE "CompanySubscriptionKind" AS ENUM ('TRIAL', 'PAID');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "companyPlanId" TEXT;

-- CreateTable
CREATE TABLE "CompanyPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "features" TEXT[],
    "badge" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySubscription" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "kind" "CompanySubscriptionKind" NOT NULL,
    "companyPlanId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPlan_slug_key" ON "CompanyPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySubscription_invoiceId_key" ON "CompanySubscription"("invoiceId");

-- CreateIndex
CREATE INDEX "CompanySubscription_identityId_endsAt_idx" ON "CompanySubscription"("identityId", "endsAt");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyPlanId_fkey" FOREIGN KEY ("companyPlanId") REFERENCES "CompanyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_companyPlanId_fkey" FOREIGN KEY ("companyPlanId") REFERENCES "CompanyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The three plans from the design
INSERT INTO "CompanyPlan" ("id", "slug", "name", "durationMonths", "price", "features", "badge", "sortOrder", "updatedAt") VALUES
  (gen_random_uuid(), 'quarterly', 'ثلاث شهور', 3, 35, ARRAY['استقبال الطلبات الخاصة.', 'إضافة خدمات.', 'الرد على الطلبات العامة.', 'عرض المشاريع في معرض الأعمال.', 'اصدار الفواتير.'], NULL, 1, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'half-year', '6 شهور', 6, 60, ARRAY['استقبال الطلبات الخاصة.', 'إضافة خدمات.', 'الرد على الطلبات العامة.', 'عرض المشاريع في معرض الأعمال.', 'اصدار الفواتير.'], NULL, 2, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'annual', 'السنوية', 12, 100, ARRAY['استقبال الطلبات الخاصة.', 'إضافة خدمات.', 'الرد على الطلبات العامة.', 'عرض المشاريع في معرض الأعمال.', 'اصدار الفواتير.'], 'الأكثر طلبا', 3, CURRENT_TIMESTAMP);

-- Companies already approved start on the 30-day free trial
INSERT INTO "CompanySubscription" ("id", "identityId", "kind", "startsAt", "endsAt")
SELECT gen_random_uuid(), c."identityId", 'TRIAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'
FROM "CompanyIdentityData" c
WHERE c."status" = 'APPROVED';
