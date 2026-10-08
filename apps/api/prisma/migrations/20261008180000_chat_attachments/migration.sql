-- Chat attachments: private photos / documents, uploaded then attached.
ALTER TYPE "MessageType" ADD VALUE 'FILE';

CREATE TYPE "AttachmentKind" AS ENUM ('IMAGE', 'FILE');

CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "uploaderIdentityId" TEXT NOT NULL,
    "messageId" TEXT,
    "kind" "AttachmentKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");
CREATE INDEX "MessageAttachment_conversationId_idx" ON "MessageAttachment"("conversationId");
CREATE INDEX "MessageAttachment_messageId_createdAt_idx" ON "MessageAttachment"("messageId", "createdAt");
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_uploaderIdentityId_fkey"
  FOREIGN KEY ("uploaderIdentityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
