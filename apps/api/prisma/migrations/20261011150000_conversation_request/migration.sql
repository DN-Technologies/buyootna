-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "requestId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_requestId_idx" ON "Conversation"("requestId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CompanyRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
