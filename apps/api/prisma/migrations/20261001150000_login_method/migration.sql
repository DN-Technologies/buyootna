-- CreateEnum
CREATE TYPE "LoginMethod" AS ENUM ('EMAIL', 'PHONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "loginMethod" "LoginMethod",
ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);

-- Backfill: until now nothing recorded how a phone got onto an account
-- (SMS-verified registration, an admin, or an unverified Edit Profile
-- change), so every phone already on file is treated as verified. From
-- here on a phone only counts as verified once an SMS code proves it.
UPDATE "User" SET "phoneVerifiedAt" = "createdAt" WHERE "phone" IS NOT NULL;
