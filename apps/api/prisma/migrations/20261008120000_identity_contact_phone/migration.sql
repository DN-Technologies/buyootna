-- Per-persona contact phone: each persona either uses the account's phone
-- (default, today's behaviour) or its own SMS-verified number.
ALTER TABLE "Identity" ADD COLUMN "useAccountPhone" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Identity" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Identity" ADD COLUMN "contactPhoneVerifiedAt" TIMESTAMP(3);
