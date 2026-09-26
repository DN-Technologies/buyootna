-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_DEVICE_LOGIN';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "pushToken" TEXT;

