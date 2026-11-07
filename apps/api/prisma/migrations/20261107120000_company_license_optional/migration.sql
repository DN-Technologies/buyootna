-- A company signs up without a licence (it comes with «طلب التوثيق»); offices still require one
-- AlterTable
ALTER TABLE "CompanyIdentityData" ALTER COLUMN "licenseNumber" DROP NOT NULL;

