-- حالة ظهور المشروع: a company can hide a portfolio project from its public
-- profile. Existing projects stay visible.
-- AlterTable
ALTER TABLE "CompanyProject" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

