-- الباقات (Figma 10180:55265 individual, 10180:16350 company), owner's prices:
-- الاساسية 1 ad 2 KD / 3 ads 6 KD, الذهبية 1 ad 7 KD / 3 ads 17.5 KD;
-- company subscriptions 29 / 48 / 87 KD with the stories line.
-- Old packages are switched off, not deleted: invoices point at them.

-- The tier's "from" price
UPDATE "Plan" SET "price" = 2, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'regular';
UPDATE "Plan" SET "price" = 7, "updatedAt" = CURRENT_TIMESTAMP WHERE "slug" = 'gold';

INSERT INTO "PlanPackage" ("id", "planId", "adsCount", "price", "sortOrder", "isActive", "updatedAt")
SELECT gen_random_uuid()::text, p."id", v."adsCount", v."price", v."sortOrder", true, CURRENT_TIMESTAMP
FROM (VALUES
  ('regular', 1, 2::double precision, 1),
  ('regular', 3, 6, 2),
  ('gold', 1, 7, 1),
  ('gold', 3, 17.5, 2)
) AS v("slug", "adsCount", "price", "sortOrder")
JOIN "Plan" p ON p."slug" = v."slug"
ON CONFLICT ("planId", "adsCount") DO UPDATE SET
  "price" = EXCLUDED."price",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "PlanPackage" pp SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
FROM "Plan" p
WHERE pp."planId" = p."id"
  AND p."slug" IN ('regular', 'gold')
  AND pp."adsCount" NOT IN (1, 3);

UPDATE "CompanyPlan" cp SET "price" = v."price", "updatedAt" = CURRENT_TIMESTAMP
FROM (VALUES
  ('quarterly', 29::double precision),
  ('half-year', 48),
  ('annual', 87)
) AS v("slug", "price")
WHERE cp."slug" = v."slug";

UPDATE "CompanyPlan"
SET "features" = array_append("features", 'نشر القصص وإضافتها إلى المميزة.'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('quarterly', 'half-year', 'annual')
  AND NOT ('نشر القصص وإضافتها إلى المميزة.' = ANY("features"));
