-- Adding a company or office records the terms agreed to on the new persona
-- AlterTable
ALTER TABLE "Identity" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" TEXT;
