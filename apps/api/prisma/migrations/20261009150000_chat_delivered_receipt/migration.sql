-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "lastDeliveredAt" TIMESTAMP(3);

-- What was read was delivered: existing chats keep two ticks
UPDATE "ConversationParticipant" SET "lastDeliveredAt" = "lastReadAt" WHERE "lastReadAt" IS NOT NULL;
