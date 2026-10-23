-- «الخدمات»: a company can hide one sub-service, or its whole service, from
-- its public profile and search. Everything stays visible.
-- AlterTable
ALTER TABLE "CompanyIdentityData" ADD COLUMN     "servicesHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CompanyService" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

