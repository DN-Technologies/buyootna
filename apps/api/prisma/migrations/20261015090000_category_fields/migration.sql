-- Per-category ad fields from the requirements document, and the owner's
-- declaration. All columns are nullable; existing rows are untouched.
CREATE TYPE "LandUse" AS ENUM ('RESIDENTIAL', 'INVESTMENT', 'COMMERCIAL', 'CRAFT');

ALTER TABLE "Property"
  ADD COLUMN "floorNumber" INTEGER,
  ADD COLUMN "apartmentsCount" INTEGER,
  ADD COLUMN "rentalStatus" TEXT,
  ADD COLUMN "landUse" "LandUse",
  ADD COLUMN "unitsCount" INTEGER,
  ADD COLUMN "monthlyIncome" DOUBLE PRECISION,
  ADD COLUMN "isCultivated" BOOLEAN,
  ADD COLUMN "isBuilt" BOOLEAN,
  ADD COLUMN "isOwner" BOOLEAN;
