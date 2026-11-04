-- The demo seed (src/core/demo-data/dev-seed.ts) stored an ad's title, or a
-- placeholder, as its location, and the cards showed «شقة فاخرة … - <company>»
-- in the location line (QA). Those seeded rows get «المحافظة - المنطقة» from
-- their own governorate and area, as the seed now writes. Only rows matching
-- the seed's exact texts change; a location a user typed is left alone.
UPDATE "Property" AS p
SET "location" = g."name" || ' - ' || a."name"
FROM "Governorate" AS g, "Area" AS a
WHERE g."id" = p."governorateId"
  AND a."id" = p."areaId"
  AND (
    p."location" LIKE 'شقة فاخرة تشطيب سوبر ديلوكس - %'
    OR p."location" LIKE 'فيلا راقية موقع بطن وظهر - %'
    OR p."location" LIKE 'بيت حكومي زاوية مجدد بالكامل - %'
    OR p."location" LIKE 'أرض فضاء موقع مميز للبدل - %'
    OR p."location" LIKE 'دور كامل للإيجار مساحات واسعة - %'
    OR p."location" LIKE 'شقة للاستثمار دخل ممتاز - %'
    OR p."location" LIKE 'شاليه مميز على البحر مباشرة - %'
    OR p."location" LIKE 'مجمع تجاري استثماري دخل مرتفع - %'
    OR p."location" LIKE 'بيت للبيع/شقة للإيجار للمالك الشخصي %'
    OR p."location" LIKE 'عقار تابع لمكتب المراجعة رقم %'
  );
