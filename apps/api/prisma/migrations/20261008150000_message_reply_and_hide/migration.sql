-- Replying to a specific message, and "delete for me" (hidden per persona).
ALTER TABLE "Message" ADD COLUMN "replyToId" TEXT;
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey"
  FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MessageHidden" (
    "messageId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageHidden_pkey" PRIMARY KEY ("messageId","identityId")
);
CREATE INDEX "MessageHidden_identityId_idx" ON "MessageHidden"("identityId");
ALTER TABLE "MessageHidden" ADD CONSTRAINT "MessageHidden_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageHidden" ADD CONSTRAINT "MessageHidden_identityId_fkey"
  FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
