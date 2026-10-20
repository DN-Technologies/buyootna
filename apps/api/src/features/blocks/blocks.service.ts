import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../core/prisma/prisma.service';
import type { BlockedAccountDto, BlockStatusDto } from './dto/block-user.dto';

// The blocked list is short in practice; this keeps one response bounded
const BLOCKED_LIST_MAX = 200;

const PROFILE_SELECT = {
  type: true,
  individualData: { select: { name: true, avatarUrl: true } },
  companyData: { select: { name: true, logoUrl: true } },
  officeData: { select: { name: true, logoUrl: true } },
} as const;

type ProfileRow = {
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
  individualData: { name: string | null; avatarUrl: string | null } | null;
  companyData: { name: string; logoUrl: string | null } | null;
  officeData: { name: string; logoUrl: string | null } | null;
};

const profileDisplay = (p: ProfileRow | null | undefined) => ({
  name:
    p?.companyData?.name ||
    p?.officeData?.name ||
    p?.individualData?.name ||
    'مستخدم بيوتنا',
  avatarUrl:
    p?.companyData?.logoUrl ||
    p?.officeData?.logoUrl ||
    p?.individualData?.avatarUrl ||
    null,
  type: p?.type ?? null,
});

/**
 * Blocking another account (Guideline 1.2). A block is account-wide and
 * one-sided to create, but contact is refused both ways (block.rules).
 */
@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Blocks an account, given it or one of its profiles; doing it again
   * changes nothing.
   */
  async block(
    blockerUserId: string,
    target: { userId?: string; identityId?: string },
  ): Promise<BlockStatusDto> {
    let blockedUserId = target.userId;
    if (!blockedUserId && target.identityId) {
      // A profile id; an account id still works here (older chats carry one)
      blockedUserId =
        (
          await this.prisma.identity.findUnique({
            where: { id: target.identityId },
            select: { userId: true },
          })
        )?.userId ?? target.identityId;
    }
    if (!blockedUserId) throw new NotFoundException('المستخدم غير موجود');
    if (blockerUserId === blockedUserId) {
      throw new BadRequestException('لا يمكنك حظر حسابك');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: blockedUserId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // Only a profile of that account is remembered for display
    const identity = target.identityId
      ? await this.prisma.identity.findFirst({
          where: { id: target.identityId, userId: blockedUserId },
          select: { id: true },
        })
      : null;

    await this.prisma.userBlock.createMany({
      data: [
        {
          blockerUserId,
          blockedUserId,
          blockedIdentityId: identity?.id ?? null,
        },
      ],
      skipDuplicates: true,
    });
    return { blocked: true };
  }

  /** Lifts a block; lifting one that isn't there changes nothing. */
  async unblock(
    blockerUserId: string,
    blockedUserId: string,
  ): Promise<BlockStatusDto> {
    await this.prisma.userBlock.deleteMany({
      where: { blockerUserId, blockedUserId },
    });
    return { blocked: false };
  }

  async status(
    blockerUserId: string,
    blockedUserId: string,
  ): Promise<BlockStatusDto> {
    const row = await this.prisma.userBlock.findUnique({
      where: {
        blockerUserId_blockedUserId: { blockerUserId, blockedUserId },
      },
      select: { blockerUserId: true },
    });
    return { blocked: !!row };
  }

  /**
   * The accounts this one blocked, newest first, each shown as the profile
   * it was blocked from (else the account's active profile).
   */
  async list(blockerUserId: string): Promise<BlockedAccountDto[]> {
    const rows = await this.prisma.userBlock.findMany({
      where: { blockerUserId },
      orderBy: [{ createdAt: 'desc' }, { blockedUserId: 'asc' }],
      take: BLOCKED_LIST_MAX,
      select: {
        blockedUserId: true,
        createdAt: true,
        blockedIdentity: { select: PROFILE_SELECT },
        blocked: {
          select: {
            identities: {
              where: { isActive: true },
              take: 1,
              select: PROFILE_SELECT,
            },
          },
        },
      },
    });
    return rows.map((r) => ({
      userId: r.blockedUserId,
      ...profileDisplay(
        (r.blockedIdentity ?? r.blocked.identities[0]) as ProfileRow | null,
      ),
      blockedAt: r.createdAt.toISOString(),
    }));
  }
}
