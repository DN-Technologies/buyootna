-- المميزة: companies and offices keep stories on their profile in named
-- highlights. A story in a highlight is kept (rows and files) until it
-- leaves every highlight; others now stay 30 days in the author's archive.
-- CreateTable
CREATE TABLE "StoryHighlight" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "title" VARCHAR(20) NOT NULL,
    "coverStoryId" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryHighlightItem" (
    "highlightId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryHighlightItem_pkey" PRIMARY KEY ("highlightId","storyId")
);

-- CreateIndex
CREATE INDEX "StoryHighlight_identityId_position_idx" ON "StoryHighlight"("identityId", "position");

-- CreateIndex
CREATE INDEX "StoryHighlightItem_storyId_idx" ON "StoryHighlightItem"("storyId");

-- AddForeignKey
ALTER TABLE "StoryHighlight" ADD CONSTRAINT "StoryHighlight_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "Identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryHighlightItem" ADD CONSTRAINT "StoryHighlightItem_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "StoryHighlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryHighlightItem" ADD CONSTRAINT "StoryHighlightItem_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
