-- «إظهار في صفحة الباقات»: the plans screen advertises this code
-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "showOnPlans" BOOLEAN NOT NULL DEFAULT false;
