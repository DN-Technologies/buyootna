-- CreateTable
CREATE TABLE "ProviderFavorite" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderFavorite_identityId_idx" ON "ProviderFavorite"("identityId");

-- CreateIndex
CREATE INDEX "ProviderFavorite_providerId_idx" ON "ProviderFavorite"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderFavorite_identityId_providerId_key" ON "ProviderFavorite"("identityId", "providerId");

-- AddForeignKey
ALTER TABLE "ProviderFavorite" ADD CONSTRAINT "ProviderFavorite_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderFavorite" ADD CONSTRAINT "ProviderFavorite_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
