-- Services catalogue v1.0 (Buyootna_RFQ_2Level_Classification_v1.0.xlsx):
-- «مكتب هندسي» and «دار استشارية» are one specialty now, and «إدارة الاملاك»
-- is spelled «إدارة الأملاك». Data only: stored names follow the catalogue,
-- so a company keeps its locked specialty and the types it already added.

UPDATE "CompanyIdentityData"
SET "specialty" = 'مكتب هندسي / دار استشارية'
WHERE "specialty" IN ('مكتب هندسي', 'دار استشارية');

UPDATE "CompanyIdentityData"
SET "specialty" = 'إدارة الأملاك'
WHERE "specialty" = 'إدارة الاملاك';

UPDATE "CompanyService"
SET "specialty" = 'مكتب هندسي / دار استشارية'
WHERE "specialty" IN ('مكتب هندسي', 'دار استشارية');

UPDATE "CompanyService"
SET "specialty" = 'إدارة الأملاك'
WHERE "specialty" = 'إدارة الاملاك';

-- "الكل" on a specialty without a list was stored as the specialty itself
UPDATE "CompanyService"
SET "type" = 'مكتب هندسي / دار استشارية'
WHERE "type" IN ('مكتب هندسي', 'دار استشارية');

UPDATE "CompanyService"
SET "type" = 'إدارة الأملاك'
WHERE "type" = 'إدارة الاملاك';

UPDATE "CompanyRequest"
SET "category" = 'مكتب هندسي / دار استشارية'
WHERE "category" IN ('مكتب هندسي', 'دار استشارية');

UPDATE "CompanyRequest"
SET "category" = 'إدارة الأملاك'
WHERE "category" = 'إدارة الاملاك';
