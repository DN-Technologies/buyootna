-- «طرق التواصل» on each ad (older ads keep both on)
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showWhatsapp" BOOLEAN NOT NULL DEFAULT true;

