-- «طلب التوثيق»: a company's licence review for the «موثق» badge

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'CHANGES_REQUESTED', 'APPROVED');

-- CreateTable
CREATE TABLE "CompanyVerificationRequest" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "licenseActivity" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" TEXT,
    "licenseFileUrl" TEXT NOT NULL,
    "licenseFileName" TEXT,
    "licenseFileSize" INTEGER,
    "licenseFileType" TEXT,
    "issues" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyVerificationRequest_identityId_createdAt_idx" ON "CompanyVerificationRequest"("identityId", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyVerificationRequest_status_idx" ON "CompanyVerificationRequest"("status");

-- AddForeignKey
ALTER TABLE "CompanyVerificationRequest" ADD CONSTRAINT "CompanyVerificationRequest_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
