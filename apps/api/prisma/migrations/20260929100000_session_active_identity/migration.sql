-- Per-device active persona: each session remembers the persona its device
-- is using. Identity.isActive stays as "last used" (the default for a new
-- device).

ALTER TABLE "Session" ADD COLUMN "activeIdentityId" TEXT;

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_activeIdentityId_fkey"
  FOREIGN KEY ("activeIdentityId") REFERENCES "Identity"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing devices keep what they were showing: the account's current persona
UPDATE "Session" s
SET "activeIdentityId" = i."id"
FROM "Identity" i
WHERE i."userId" = s."userId" AND i."isActive" = true;
