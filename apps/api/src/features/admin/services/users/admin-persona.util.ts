import { NotFoundException } from '@nestjs/common';
import { IdentityType, Prisma, PrismaClient } from '@prisma/client';

type Db = Prisma.TransactionClient | PrismaClient;

/**
 * The persona (`?identityId=`) a user-detail tab is about, checked as one of
 * this account's: the admin page shows one identity of an account at a time.
 */
export async function findOwnedIdentity(
  db: Db,
  userId: string,
  identityId: string,
): Promise<{ id: string; type: IdentityType }> {
  const identity = await db.identity.findFirst({
    where: { id: identityId, userId },
    select: { id: true, type: true },
  });
  if (!identity) throw new NotFoundException('الهوية غير موجودة');
  return identity;
}
