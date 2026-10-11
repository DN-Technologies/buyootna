-- CreateTable
CREATE TABLE "CompanyService" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyService_identityId_idx" ON "CompanyService"("identityId");

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
