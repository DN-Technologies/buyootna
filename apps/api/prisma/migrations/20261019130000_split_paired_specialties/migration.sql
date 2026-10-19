-- «مكتب هندسي / دار استشارية» and «مقاول عام / مقاول بناء» are two
-- specialties each again (services catalogue). Production held no rows with
-- the paired names when this was written; any other database's are moved to
-- the first of the pair, which offers the same service types. Data only.

UPDATE "CompanyIdentityData"
SET "specialty" = 'مكتب هندسي'
WHERE "specialty" = 'مكتب هندسي / دار استشارية';

UPDATE "CompanyIdentityData"
SET "specialty" = 'مقاول عام'
WHERE "specialty" = 'مقاول عام / مقاول بناء';

UPDATE "CompanyService"
SET "specialty" = 'مكتب هندسي'
WHERE "specialty" = 'مكتب هندسي / دار استشارية';

UPDATE "CompanyService"
SET "specialty" = 'مقاول عام'
WHERE "specialty" = 'مقاول عام / مقاول بناء';

UPDATE "CompanyRequest"
SET "category" = 'مكتب هندسي'
WHERE "category" = 'مكتب هندسي / دار استشارية';

UPDATE "CompanyRequest"
SET "category" = 'مقاول عام'
WHERE "category" = 'مقاول عام / مقاول بناء';
