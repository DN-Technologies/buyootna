import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { PrismaService } from '../../core/prisma/prisma.service';

type Db = Prisma.TransactionClient | PrismaService;

/** Either account blocked the other (blocks work both ways for contact). */
export async function isBlockedEitherWay(
  db: Db,
  a: string,
  b: string,
): Promise<boolean> {
  if (a === b) return false;
  const row = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerUserId: a, blockedUserId: b },
        { blockerUserId: b, blockedUserId: a },
      ],
    },
    select: { blockerUserId: true },
  });
  return !!row;
}

/**
 * Every account this one blocked or was blocked by: their content is hidden
 * from it and contact is refused both ways.
 */
export async function blockedUserIdsFor(
  db: Db,
  userId: string,
): Promise<string[]> {
  const rows = await db.userBlock.findMany({
    where: { OR: [{ blockerUserId: userId }, { blockedUserId: userId }] },
    select: { blockerUserId: true, blockedUserId: true },
  });
  return [
    ...new Set(
      rows.map((r) =>
        r.blockerUserId === userId ? r.blockedUserId : r.blockerUserId,
      ),
    ),
  ];
}

/** SQL for raw queries: no block either way between `viewer` and `other`. */
export function notBlockedSql(
  viewerUserId: string,
  otherUserIdColumn: Prisma.Sql,
): Prisma.Sql {
  return Prisma.sql`NOT EXISTS (
    SELECT 1 FROM "UserBlock" ub
    WHERE (ub."blockerUserId" = ${viewerUserId} AND ub."blockedUserId" = ${otherUserIdColumn})
       OR (ub."blockerUserId" = ${otherUserIdColumn} AND ub."blockedUserId" = ${viewerUserId})
  )`;
}

/** The answer when contact is refused because of a block. */
export function blockedContactError(): ForbiddenException {
  return new ForbiddenException({
    statusCode: 403,
    message: 'لا يمكنك مراسلة هذا المستخدم',
    code: 'USER_BLOCKED',
  });
}
