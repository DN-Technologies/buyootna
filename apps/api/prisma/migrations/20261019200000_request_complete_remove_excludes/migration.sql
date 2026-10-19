-- Company requests by status (Figma): «العرض لا يشمل» on an offer, ending an
-- accepted request (انهاء الطلب), and removing one from a company's lists.

-- AlterTable
ALTER TABLE "RequestOffer" ADD COLUMN "excludes" TEXT;

-- AlterTable
ALTER TABLE "CompanyRequest" ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "completedVia" TEXT;

-- AlterTable: existing dismissals are public requests the company rejected
ALTER TABLE "RequestDismissal" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'rejected';
