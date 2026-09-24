-- Password change session invalidation: timestamp used by JwtStrategy to
-- reject legacy no-sid tokens issued before this point on the account.
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);
