-- Cleanup Script: Remove Abandoned Pre-OTP User Registrations
--
-- WHY: Before registration was changed to defer account creation until the
-- Twilio Verify OTP succeeds, every phone signup attempt created a full
-- User + IndividualProfile + Identity immediately. Abandoned attempts
-- polluted the users table (and the Admin Dashboard) and permanently
-- squatted unique phone numbers. The API no longer creates such rows; this
-- script removes the legacy pollution.
--
-- HEURISTIC (no verification flag was ever recorded, so candidates are
-- inferred): individual users registered by phone only, who never logged
-- in (a verified signup logs in immediately at OTP-verify time, which
-- creates a Session row), never received a notification, have no social
-- account link, and were created more than 7 days ago.
--
-- CAVEATS:
-- 1. An admin-created individual who never logged in could match. Review
--    the STEP 1 output row by row before running STEP 2.
-- 2. Deleting "User" cascades to Identity/IndividualProfile/Session/
--    Notification/SocialAccount (Prisma onDelete: Cascade). If any stray
--    legacy FK row (e.g. Property.userId) exists without a cascade, the
--    DELETE fails loudly and removes nothing -- safe to retry after
--    inspecting that user.
-- 3. Take a database backup before running STEP 2.
--
-- Usage (example):
--   psql "$DATABASE_URL" -f cleanup_unverified_users.sql
-- Run STEP 1 first, review, then uncomment and run STEP 2.

-- =====================================================
-- STEP 1: DRY RUN - list candidate users (no writes)
-- =====================================================

SELECT
  u.id,
  u.phone,
  u.name,
  u."createdAt",
  u."updatedAt"
FROM "User" u
WHERE u.role = 'INDIVIDUAL'
  AND u.phone IS NOT NULL
  AND u.email IS NULL
  AND u."isAdmin" = false
  AND NOT EXISTS (SELECT 1 FROM "Session" s WHERE s."userId" = u.id)
  AND NOT EXISTS (SELECT 1 FROM "Notification" n WHERE n."userId" = u.id)
  AND NOT EXISTS (SELECT 1 FROM "SocialAccount" sa WHERE sa."userId" = u.id)
  AND u."createdAt" < NOW() - INTERVAL '7 days'
ORDER BY u."createdAt" ASC;

-- Candidate count:
-- SELECT COUNT(*) FROM "User" u
-- WHERE u.role = 'INDIVIDUAL'
--   AND u.phone IS NOT NULL
--   AND u.email IS NULL
--   AND u."isAdmin" = false
--   AND NOT EXISTS (SELECT 1 FROM "Session" s WHERE s."userId" = u.id)
--   AND NOT EXISTS (SELECT 1 FROM "Notification" n WHERE n."userId" = u.id)
--   AND NOT EXISTS (SELECT 1 FROM "SocialAccount" sa WHERE sa."userId" = u.id)
--   AND u."createdAt" < NOW() - INTERVAL '7 days';

-- =====================================================
-- STEP 2: DELETE (uncomment ONLY after reviewing STEP 1,
--         and only after taking a database backup)
-- =====================================================

-- DELETE FROM "User"
-- WHERE id IN (
--   SELECT u.id
--   FROM "User" u
--   WHERE u.role = 'INDIVIDUAL'
--     AND u.phone IS NOT NULL
--     AND u.email IS NULL
--     AND u."isAdmin" = false
--     AND NOT EXISTS (SELECT 1 FROM "Session" s WHERE s."userId" = u.id)
--     AND NOT EXISTS (SELECT 1 FROM "Notification" n WHERE n."userId" = u.id)
--     AND NOT EXISTS (SELECT 1 FROM "SocialAccount" sa WHERE sa."userId" = u.id)
--     AND u."createdAt" < NOW() - INTERVAL '7 days'
-- );

-- =====================================================
-- VERIFICATION (run after STEP 2)
-- =====================================================

-- The same STEP 1 query should now return zero rows.
-- =====================================================
-- NOTES:
-- 1. New abandoned registrations can no longer exist: the API defers
--    account creation until OTP verification succeeds.
-- 2. Heuristic threshold (7 days) can be tuned per environment by editing
--    the INTERVAL above before running.
-- =====================================================
