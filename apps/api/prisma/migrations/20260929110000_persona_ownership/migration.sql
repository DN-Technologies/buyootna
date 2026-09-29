-- Per-persona ownership: wallet credits, invoices, favorites, chat
-- participants and review reactions belong to a persona (Identity), and the
-- welcome free ad is per persona. Legacy userId columns stay for now; they
-- are dropped in a later release once production runs on this code.

-- 1. The free ad moves onto the persona. The account's earliest persona
--    inherits what the account had left; its other existing personas get
--    none. Personas created from now on start with one.
ALTER TABLE "Identity" ADD COLUMN "freeAdsRemaining" INTEGER NOT NULL DEFAULT 1;

WITH ranked AS (
  SELECT i."id", i."userId",
         row_number() OVER (PARTITION BY i."userId" ORDER BY i."createdAt", i."id") AS rn
  FROM "Identity" i
)
UPDATE "Identity" i
SET "freeAdsRemaining" = CASE WHEN r.rn = 1 THEN COALESCE(u."freeAdsRemaining", 0) ELSE 0 END
FROM ranked r
JOIN "User" u ON u."id" = r."userId"
WHERE r."id" = i."id";

-- 2. The persona a legacy (userId-only) row goes to: the account's
--    individual persona, else its earliest one
CREATE TEMP TABLE default_persona AS
SELECT DISTINCT ON (i."userId") i."userId", i."id" AS "identityId"
FROM "Identity" i
ORDER BY i."userId", (i."type" <> 'INDIVIDUAL'), i."createdAt", i."id";

UPDATE "UserPlanSlot" t SET "identityId" = d."identityId"
FROM default_persona d
WHERE t."identityId" IS NULL AND t."userId" = d."userId";

UPDATE "Invoice" t SET "identityId" = d."identityId"
FROM default_persona d
WHERE t."identityId" IS NULL AND t."userId" = d."userId";

-- Favorites/reactions: a legacy row the persona already has (or a repeated
-- legacy row) is a duplicate and is dropped instead of colliding
DELETE FROM "Favorite" f
USING default_persona d
WHERE f."identityId" IS NULL AND f."userId" = d."userId"
  AND EXISTS (SELECT 1 FROM "Favorite" f2
              WHERE f2."identityId" = d."identityId" AND f2."propertyId" = f."propertyId");
DELETE FROM "Favorite" f
WHERE f."identityId" IS NULL
  AND EXISTS (SELECT 1 FROM "Favorite" f2
              WHERE f2."identityId" IS NULL AND f2."userId" = f."userId"
                AND f2."propertyId" = f."propertyId" AND f2."id" < f."id");
UPDATE "Favorite" t SET "identityId" = d."identityId"
FROM default_persona d
WHERE t."identityId" IS NULL AND t."userId" = d."userId";

DELETE FROM "ReviewReaction" r
USING default_persona d
WHERE r."identityId" IS NULL AND r."userId" = d."userId"
  AND EXISTS (SELECT 1 FROM "ReviewReaction" r2
              WHERE r2."identityId" = d."identityId" AND r2."reviewId" = r."reviewId");
DELETE FROM "ReviewReaction" r
WHERE r."identityId" IS NULL
  AND EXISTS (SELECT 1 FROM "ReviewReaction" r2
              WHERE r2."identityId" IS NULL AND r2."userId" = r."userId"
                AND r2."reviewId" = r."reviewId" AND r2."id" < r."id");
UPDATE "ReviewReaction" t SET "identityId" = d."identityId"
FROM default_persona d
WHERE t."identityId" IS NULL AND t."userId" = d."userId";

-- Chat: a legacy participant whose account is already in the conversation
-- through a persona is a duplicate. Otherwise it becomes the persona that
-- owns the conversation's ad, if that's theirs, else the default persona.
DELETE FROM "ConversationParticipant" p
WHERE p."identityId" IS NULL
  AND EXISTS (SELECT 1 FROM "ConversationParticipant" p2
              JOIN "Identity" i ON i."id" = p2."identityId"
              WHERE p2."conversationId" = p."conversationId" AND i."userId" = p."userId");
UPDATE "ConversationParticipant" p
SET "identityId" = COALESCE(
  (SELECT pr."identityId"
   FROM "Conversation" c
   JOIN "Property" pr ON pr."id" = c."propertyId"
   JOIN "Identity" i ON i."id" = pr."identityId"
   WHERE c."id" = p."conversationId" AND i."userId" = p."userId"),
  d."identityId")
FROM default_persona d
WHERE p."identityId" IS NULL AND p."userId" = d."userId";

-- Messages sent under the legacy user id: attribute them to the sender's
-- persona in that conversation
UPDATE "Message" m
SET "senderIdentityId" = p."identityId"
FROM "ConversationParticipant" p
WHERE m."senderIdentityId" IS NULL AND m."senderId" IS NOT NULL
  AND p."conversationId" = m."conversationId" AND p."userId" = m."senderId";

DROP TABLE default_persona;

-- 3. Nothing may be left without a persona; stop rather than lose data
DO $$
DECLARE
  t text;
  n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY['UserPlanSlot','Invoice','Favorite','ConversationParticipant','ReviewReaction'] LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE "identityId" IS NULL', t) INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION 'persona_ownership: % rows in % have no persona to move to (their account has no persona). Resolve them before migrating.', n, t;
    END IF;
  END LOOP;
END $$;

-- 4. Contract the ownership: identityId is required from now on
ALTER TABLE "UserPlanSlot" ALTER COLUMN "identityId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "identityId" SET NOT NULL;
ALTER TABLE "Favorite" ALTER COLUMN "identityId" SET NOT NULL;
ALTER TABLE "ConversationParticipant" ALTER COLUMN "identityId" SET NOT NULL;
ALTER TABLE "ReviewReaction" ALTER COLUMN "identityId" SET NOT NULL;
