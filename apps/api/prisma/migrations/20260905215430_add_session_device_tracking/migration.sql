-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "platform" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_deviceId_key" ON "Session"("userId", "deviceId");
