-- A chat message sent as a reply to a story. Additive: both columns are empty
-- for every existing message.
ALTER TABLE "Message" ADD COLUMN "storyId" TEXT;
ALTER TABLE "Message" ADD COLUMN "storyMediaType" "StoryMediaType";

-- Needed for the ON DELETE SET NULL when the cleanup purges a story
CREATE INDEX "Message_storyId_idx" ON "Message"("storyId");

ALTER TABLE "Message" ADD CONSTRAINT "Message_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
