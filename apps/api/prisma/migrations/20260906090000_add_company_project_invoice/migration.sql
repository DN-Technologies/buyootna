-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyProject" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyInvoice" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "warrantyMonths" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyProject_identityId_idx" ON "CompanyProject"("identityId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CompanyInvoice_invoiceNo_key" ON "CompanyInvoice"("invoiceNo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyInvoice_identityId_idx" ON "CompanyInvoice"("identityId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "CompanyProject" ADD CONSTRAINT "CompanyProject_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "CompanyInvoice" ADD CONSTRAINT "CompanyInvoice_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
