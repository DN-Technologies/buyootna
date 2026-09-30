-- AlterTable
ALTER TABLE "User" ADD COLUMN "suspendedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AccountSuspension" ADD COLUMN "until" TIMESTAMP(3);
