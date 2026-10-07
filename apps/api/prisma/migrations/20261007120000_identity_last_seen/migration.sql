-- When each persona last used the app, for the public activity badge
-- (نشط الآن / نشط منذ). Nullable: personas start with no activity recorded.
ALTER TABLE "Identity" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
