-- CreateEnum
CREATE TYPE "AdminActorType" AS ENUM ('ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('PROPERTY_DELETED', 'PROPERTY_HIDDEN', 'PROPERTY_UNHIDDEN', 'PROPERTY_FEATURED', 'PROPERTY_REPUBLISHED', 'REPORT_RESOLVED', 'REPORT_DISMISSED', 'REPORT_ASSIGNED', 'REPORT_PRIORITY_CHANGED', 'IDENTITY_APPROVED', 'IDENTITY_REJECTED', 'IDENTITY_EDIT_REQUESTED', 'COUPON_GRANTED', 'COUPON_BULK_GRANTED', 'USER_STATUS_CHANGED', 'USER_NOTIFIED', 'PLAN_CHANGED', 'EXCEPTIONAL_FEATURE_GRANTED', 'COMPANY_PROJECT_DELETED');

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "actorType" "AdminActorType" NOT NULL DEFAULT 'ADMIN',
    "actorAdminId" TEXT,
    "action" "AdminActionType" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNote" (
    "id" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "authorAdminId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'ملاحظة',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminActionLog_targetUserId_idx" ON "AdminActionLog"("targetUserId");

-- CreateIndex
CREATE INDEX "AdminActionLog_action_idx" ON "AdminActionLog"("action");

-- CreateIndex
CREATE INDEX "AdminActionLog_createdAt_idx" ON "AdminActionLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_targetType_targetId_idx" ON "AdminActionLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AdminNote_targetUserId_idx" ON "AdminNote"("targetUserId");

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_actorAdminId_fkey" FOREIGN KEY ("actorAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNote" ADD CONSTRAINT "AdminNote_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNote" ADD CONSTRAINT "AdminNote_authorAdminId_fkey" FOREIGN KEY ("authorAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
