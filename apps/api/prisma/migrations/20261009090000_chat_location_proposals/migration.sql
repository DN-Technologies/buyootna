-- CreateEnum
CREATE TYPE "ProposalKind" AS ENUM ('APPOINTMENT', 'OFFER');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COUNTERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferPeriod" AS ENUM ('TOTAL', 'MONTHLY', 'YEARLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttachmentKind" ADD VALUE 'VIDEO';
ALTER TYPE "AttachmentKind" ADD VALUE 'AUDIO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MessageType" ADD VALUE 'LOCATION';
ALTER TYPE "MessageType" ADD VALUE 'APPOINTMENT';
ALTER TYPE "MessageType" ADD VALUE 'OFFER';
ALTER TYPE "MessageType" ADD VALUE 'VIDEO';
ALTER TYPE "MessageType" ADD VALUE 'VOICE';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationLabel" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MessageAttachment" ADD COLUMN     "durationMs" INTEGER;

-- CreateTable
CREATE TABLE "ChatProposal" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "kind" "ProposalKind" NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "amount" DECIMAL(14,3),
    "currency" TEXT NOT NULL DEFAULT 'KWD',
    "period" "OfferPeriod",
    "note" TEXT,
    "counterOfId" TEXT,
    "respondedById" TEXT,
    "respondedAt" TIMESTAMP(3),
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatProposal_messageId_key" ON "ChatProposal"("messageId");

-- CreateIndex
CREATE INDEX "ChatProposal_kind_status_scheduledAt_idx" ON "ChatProposal"("kind", "status", "scheduledAt");

-- AddForeignKey
ALTER TABLE "ChatProposal" ADD CONSTRAINT "ChatProposal_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatProposal" ADD CONSTRAINT "ChatProposal_counterOfId_fkey" FOREIGN KEY ("counterOfId") REFERENCES "ChatProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

