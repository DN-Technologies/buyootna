-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suspendedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AccountSuspension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reasons" TEXT[],
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reactivatedAt" TIMESTAMP(3),

    CONSTRAINT "AccountSuspension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountSuspension_userId_idx" ON "AccountSuspension"("userId");

-- AddForeignKey
ALTER TABLE "AccountSuspension" ADD CONSTRAINT "AccountSuspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
