-- مواعيد العمل for companies and offices: the week, Sunday first, each day
-- open or closed with up to three time ranges (HH:mm).
ALTER TABLE "CompanyIdentityData" ADD COLUMN "workingHours" JSONB;
ALTER TABLE "OfficeIdentityData" ADD COLUMN "workingHours" JSONB;
