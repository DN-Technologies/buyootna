-- Migration Script: Migrate Users to Identity System
-- Run this AFTER applying the Prisma schema changes
-- IMPORTANT: Take a database backup before running this migration!

-- =====================================================
-- STEP 1: Create identities for existing users
-- =====================================================

-- Create INDIVIDUAL identities for all users with role = 'INDIVIDUAL'
INSERT INTO "Identity" (id, "userId", type, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  id,
  'INDIVIDUAL'::"IdentityType",
  true,
  NOW(),
  NOW()
FROM "User"
WHERE role = 'INDIVIDUAL';

-- Create COMPANY identities for all users with role = 'COMPANY'
INSERT INTO "Identity" (id, "userId", type, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  id,
  'COMPANY'::"IdentityType",
  true,
  NOW(),
  NOW()
FROM "User"
WHERE role = 'COMPANY';

-- Create OFFICE identities for all users with role = 'OFFICE'
INSERT INTO "Identity" (id, "userId", type, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  id,
  'OFFICE'::"IdentityType",
  true,
  NOW(),
  NOW()
FROM "User"
WHERE role = 'OFFICE';

-- =====================================================
-- STEP 2: Migrate profile data to identity data tables
-- =====================================================

-- Migrate IndividualProfile data to IndividualIdentityData
INSERT INTO "IndividualIdentityData" (id, "identityId", name, whatsapp, "avatarUrl", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  i.id,
  u.name,
  u.whatsapp,
  u."avatarUrl",
  NOW(),
  NOW()
FROM "Identity" i
JOIN "User" u ON i."userId" = u.id
WHERE i.type = 'INDIVIDUAL';

-- Migrate CompanyProfile data to CompanyIdentityData
INSERT INTO "CompanyIdentityData" (
  id, "identityId", name, services, "hqLocation", "serviceAreas", about,
  "licenseActivity", "licenseNumber", "licenseExpiry", "logoUrl", "licenseFileUrl",
  latitude, longitude, specialty, "isVerified", status, "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  i.id,
  cp.name,
  cp.services,
  cp."hqLocation",
  cp."serviceAreas",
  cp.about,
  cp."licenseActivity",
  cp."licenseNumber",
  cp."licenseExpiry",
  cp."logoUrl",
  cp."licenseFileUrl",
  cp.latitude,
  cp.longitude,
  cp.specialty,
  cp."isVerified",
  cp.status,
  NOW(),
  NOW()
FROM "Identity" i
JOIN "User" u ON i."userId" = u.id
JOIN "CompanyProfile" cp ON cp."userId" = u.id
WHERE i.type = 'COMPANY';

-- Migrate OfficeProfile data to OfficeIdentityData
INSERT INTO "OfficeIdentityData" (
  id, "identityId", name, services, "hqLocation", about,
  "licenseActivity", "licenseNumber", "licenseExpiry", "logoUrl", "licenseFileUrl",
  "isVerified", status, "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  i.id,
  op.name,
  op.services,
  op."hqLocation",
  op.about,
  op."licenseActivity",
  op."licenseNumber",
  op."licenseExpiry",
  op."logoUrl",
  op."licenseFileUrl",
  op."isVerified",
  op.status,
  NOW(),
  NOW()
FROM "Identity" i
JOIN "User" u ON i."userId" = u.id
JOIN "OfficeProfile" op ON op."userId" = u.id
WHERE i.type = 'OFFICE';

-- =====================================================
-- STEP 3: Update foreign keys in related tables
-- =====================================================

-- Update Property.identityId from userId
UPDATE "Property" p
SET "identityId" = i.id
FROM "Identity" i
WHERE p."userId" = i."userId" AND i."isActive" = true;

-- Update PropertyDeletionLog.identityId from userId
UPDATE "PropertyDeletionLog" pdl
SET "identityId" = i.id
FROM "Identity" i
WHERE pdl."userId" = i."userId" AND i."isActive" = true;

-- Update Favorite.identityId from userId
UPDATE "Favorite" f
SET "identityId" = i.id
FROM "Identity" i
WHERE f."userId" = i."userId" AND i."isActive" = true;

-- Update ConversationParticipant.identityId from userId
UPDATE "ConversationParticipant" cp
SET "identityId" = i.id
FROM "Identity" i
WHERE cp."userId" = i."userId" AND i."isActive" = true;

-- Update Message.senderIdentityId from senderId
UPDATE "Message" m
SET "senderIdentityId" = i.id
FROM "Identity" i
WHERE m."senderId" = i."userId" AND i."isActive" = true;

-- Update Review.reviewerIdentityId from reviewerId
UPDATE "Review" r
SET "reviewerIdentityId" = i.id
FROM "Identity" i
WHERE r."reviewerId" = i."userId" AND i."isActive" = true;

-- Update Review.targetIdentityId from targetUserId
UPDATE "Review" r
SET "targetIdentityId" = i.id
FROM "Identity" i
WHERE r."targetUserId" = i."userId" AND i."isActive" = true;

-- Update ReviewReaction.identityId from userId
UPDATE "ReviewReaction" rr
SET "identityId" = i.id
FROM "Identity" i
WHERE rr."userId" = i."userId" AND i."isActive" = true;

-- Update UserPlanSlot.identityId from userId
UPDATE "UserPlanSlot" ups
SET "identityId" = i.id
FROM "Identity" i
WHERE ups."userId" = i."userId" AND i."isActive" = true;

-- Update Invoice.identityId from userId
UPDATE "Invoice" inv
SET "identityId" = i.id
FROM "Identity" i
WHERE inv."userId" = i."userId" AND i."isActive" = true;

-- =====================================================
-- STEP 4: Migrate ReviewRequest relations
-- =====================================================

-- Update ReviewRequest to use CompanyIdentityData
UPDATE "ReviewRequest" rr
SET "companyIdentityDataId" = cid.id
FROM "CompanyIdentityData" cid
JOIN "Identity" i ON cid."identityId" = i.id
JOIN "User" u ON i."userId" = u.id
JOIN "CompanyProfile" cp ON cp."userId" = u.id
WHERE rr."companyProfileId" = cp.id;

-- Update ReviewRequest to use OfficeIdentityData
UPDATE "ReviewRequest" rr
SET "officeIdentityDataId" = oid.id
FROM "OfficeIdentityData" oid
JOIN "Identity" i ON oid."identityId" = i.id
JOIN "User" u ON i."userId" = u.id
JOIN "OfficeProfile" op ON op."userId" = u.id
WHERE rr."officeProfileId" = op.id;

-- =====================================================
-- VERIFICATION QUERIES (Run after migration)
-- =====================================================

-- Check identity count matches user count
-- SELECT
--   (SELECT COUNT(*) FROM "User") as user_count,
--   (SELECT COUNT(*) FROM "Identity") as identity_count;

-- Check all properties have identityId set
-- SELECT COUNT(*) as unlinked_properties
-- FROM "Property"
-- WHERE "identityId" IS NULL AND "userId" IS NOT NULL;

-- Check all favorites have identityId set
-- SELECT COUNT(*) as unlinked_favorites
-- FROM "Favorite"
-- WHERE "identityId" IS NULL AND "userId" IS NOT NULL;

-- =====================================================
-- NOTES:
-- 1. This migration creates one identity per user based on their role
-- 2. The isActive flag is set to true for the created identity
-- 3. Legacy userId columns are NOT dropped (kept for rollback capability)
-- 4. After verifying migration success, legacy columns can be removed
--    in a future migration
-- =====================================================
