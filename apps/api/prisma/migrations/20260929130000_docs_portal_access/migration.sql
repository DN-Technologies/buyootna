-- Docs portal access: one password (bcrypt hash) per docs role

-- CreateEnum
CREATE TYPE "DocsRole" AS ENUM ('QA', 'DEVELOPER', 'UIUX', 'CLIENT', 'ADMIN');

-- CreateTable
CREATE TABLE "DocsRoleCredential" (
    "role" "DocsRole" NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocsRoleCredential_pkey" PRIMARY KEY ("role")
);

