-- Accounts that never chose a sign-in method start on the identifier they
-- have: a phone-only account signs in with its phone, an email-only one
-- with its email. Accounts with both keep BOTH (null), and any method a
-- user already picked is left alone. A blank value counts as missing.
-- Data only; no schema change.
UPDATE "User"
SET "loginMethod" = 'PHONE'
WHERE "loginMethod" IS NULL
  AND COALESCE(TRIM("email"), '') = ''
  AND COALESCE(TRIM("phone"), '') <> '';

UPDATE "User"
SET "loginMethod" = 'EMAIL'
WHERE "loginMethod" IS NULL
  AND COALESCE(TRIM("phone"), '') = ''
  AND COALESCE(TRIM("email"), '') <> '';
