-- Persona rules: one persona of each type per account, and licence numbers
-- unique platform-wide (stored normalised).

-- 1. Normalise stored licence numbers: no whitespace, Arabic-Indic and
--    Eastern Arabic digits -> Western, so uniqueness compares like with like
UPDATE "CompanyIdentityData"
SET "licenseNumber" = translate(
  regexp_replace("licenseNumber", '\s', '', 'g'),
  '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789');
UPDATE "OfficeIdentityData"
SET "licenseNumber" = translate(
  regexp_replace("licenseNumber", '\s', '', 'g'),
  '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789');

-- 2. Same-type duplicate personas (e.g. a double-submitted "add company"):
--    keep the oldest; delete a newer one ONLY if nothing at all references
--    it. Every foreign key pointing at "Identity" is checked (found from the
--    catalog, so new tables are covered too), except the persona's own 1:1
--    profile rows, which go with it. Anything owned -> the migration stops.
DO $$
DECLARE
  dup RECORD;
  fk RECORD;
  n BIGINT;
BEGIN
  FOR dup IN
    SELECT i.id, i."userId", i.type
    FROM "Identity" i
    WHERE EXISTS (
      SELECT 1 FROM "Identity" o
      WHERE o."userId" = i."userId" AND o.type = i.type
        AND (o."createdAt", o.id) < (i."createdAt", i.id)
    )
  LOOP
    FOR fk IN
      SELECT c.conrelid::regclass AS tbl, a.attname AS col
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
      WHERE c.contype = 'f'
        AND c.confrelid = '"Identity"'::regclass
        AND c.conrelid::regclass::text NOT IN (
          '"IndividualIdentityData"', '"CompanyIdentityData"', '"OfficeIdentityData"'
        )
    LOOP
      EXECUTE format('SELECT count(*) FROM %s WHERE %I = $1', fk.tbl, fk.col)
        INTO n USING dup.id;
      IF n > 0 THEN
        RAISE EXCEPTION
          'Duplicate % persona % (user %) owns % row(s) in %.%; merge it by hand before migrating',
          dup.type, dup.id, dup."userId", n, fk.tbl, fk.col;
      END IF;
    END LOOP;
    DELETE FROM "Identity" WHERE id = dup.id;
    RAISE NOTICE 'Removed empty duplicate % persona % of user %', dup.type, dup.id, dup."userId";
  END LOOP;
END $$;

-- 3. Constraints
CREATE UNIQUE INDEX "Identity_userId_type_key" ON "Identity"("userId", "type");
CREATE UNIQUE INDEX "CompanyIdentityData_licenseNumber_key" ON "CompanyIdentityData"("licenseNumber");
CREATE UNIQUE INDEX "OfficeIdentityData_licenseNumber_key" ON "OfficeIdentityData"("licenseNumber");
