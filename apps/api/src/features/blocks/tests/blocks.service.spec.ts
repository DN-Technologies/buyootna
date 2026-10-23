import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../../../core/prisma/prisma.service';
import {
  blockedUserIdsFor,
  isBlockedEitherWay,
  notBlockedSql,
} from '../block.rules';
import { BlocksService } from '../blocks.service';
import { ReportsService } from '../../reports/reports.service';
import { BlockUserDto } from '../dto/block-user.dto';
import { Prisma } from '@prisma/client';

describe('BlocksService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    identity: { findFirst: jest.fn(), findUnique: jest.fn() },
    userBlock: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const reports = { createForBlock: jest.fn().mockResolvedValue(undefined) };
  const service = new BlocksService(
    prisma as unknown as PrismaService,
    reports as unknown as ReportsService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u2' });
    prisma.identity.findFirst.mockResolvedValue({ id: 'u2-company' });
    prisma.userBlock.createMany.mockResolvedValue({ count: 1 });
  });

  it('a new block is filed as a report for the moderators, with the reason (Guideline 1.2)', async () => {
    await service.block(
      'u1',
      { userId: 'u2', identityId: 'u2-company' },
      { blockerIdentityId: 'u1-me', reason: 'رسائل مسيئة' },
    );
    expect(reports.createForBlock).toHaveBeenCalledWith(
      { userId: 'u1', identityId: 'u1-me' },
      { userId: 'u2', identityId: 'u2-company' },
      'رسائل مسيئة',
    );
  });

  it('blocking again files no second report', async () => {
    prisma.userBlock.createMany.mockResolvedValue({ count: 0 });
    await service.block('u1', { userId: 'u2' });
    expect(reports.createForBlock).not.toHaveBeenCalled();
  });

  it('the block stands when filing its report fails', async () => {
    reports.createForBlock.mockRejectedValueOnce(new Error('db down'));
    await expect(service.block('u1', { userId: 'u2' })).resolves.toEqual({
      blocked: true,
    });
  });

  it('blocks an account, remembering the profile it was blocked from; repeating changes nothing', async () => {
    await expect(
      service.block('u1', { userId: 'u2', identityId: 'u2-company' }),
    ).resolves.toEqual({
      blocked: true,
    });
    expect(prisma.identity.findFirst).toHaveBeenCalledWith({
      // Only a profile of that same account
      where: { id: 'u2-company', userId: 'u2' },
      select: { id: true },
    });
    expect(prisma.userBlock.createMany).toHaveBeenCalledWith({
      data: [
        {
          blockerUserId: 'u1',
          blockedUserId: 'u2',
          blockedIdentityId: 'u2-company',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('a profile of someone else is not remembered', async () => {
    prisma.identity.findFirst.mockResolvedValue(null);
    await service.block('u1', { userId: 'u2', identityId: 'other-ident' });
    expect(prisma.userBlock.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ blockedIdentityId: null })],
      }),
    );
  });

  it('not yourself, and not an account that does not exist', async () => {
    await expect(service.block('u1', { userId: 'u1' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.block('u1', { userId: 'ghost' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.userBlock.createMany).not.toHaveBeenCalled();
  });

  it('a profile alone is enough: its account is blocked', async () => {
    prisma.identity.findUnique.mockResolvedValue({ userId: 'u2' });
    await service.block('u1', { identityId: 'u2-company' });
    expect(prisma.userBlock.createMany).toHaveBeenCalledWith({
      data: [
        {
          blockerUserId: 'u1',
          blockedUserId: 'u2',
          blockedIdentityId: 'u2-company',
        },
      ],
      skipDuplicates: true,
    });
  });

  it('an account id in place of a profile still works (older chats)', async () => {
    prisma.identity.findUnique.mockResolvedValue(null);
    prisma.identity.findFirst.mockResolvedValue(null);
    await service.block('u1', { identityId: 'u2' });
    expect(prisma.userBlock.createMany).toHaveBeenCalledWith({
      data: [
        { blockerUserId: 'u1', blockedUserId: 'u2', blockedIdentityId: null },
      ],
      skipDuplicates: true,
    });
  });

  it('your own profile cannot be blocked, nor an unknown one', async () => {
    prisma.identity.findUnique.mockResolvedValueOnce({ userId: 'u1' });
    await expect(
      service.block('u1', { identityId: 'my-company' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    // Not a profile, nor an account
    prisma.identity.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.block('u1', { identityId: 'nobody' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('unblocking removes only this account’s block', async () => {
    await expect(service.unblock('u1', 'u2')).resolves.toEqual({
      blocked: false,
    });
    expect(prisma.userBlock.deleteMany).toHaveBeenCalledWith({
      where: { blockerUserId: 'u1', blockedUserId: 'u2' },
    });
  });

  it('status says whether this account blocked the other', async () => {
    prisma.userBlock.findUnique
      .mockResolvedValueOnce({ blockerUserId: 'u1' })
      .mockResolvedValueOnce(null);
    await expect(service.status('u1', 'u2')).resolves.toEqual({
      blocked: true,
    });
    await expect(service.status('u1', 'u3')).resolves.toEqual({
      blocked: false,
    });
  });

  it('the list shows the profile blocked from, else the active profile', async () => {
    prisma.userBlock.findMany.mockResolvedValue([
      {
        blockedUserId: 'u2',
        createdAt: new Date('2026-10-21T10:00:00Z'),
        blockedIdentity: {
          type: 'COMPANY',
          individualData: null,
          companyData: { name: 'شركة', logoUrl: 'logo' },
          officeData: null,
        },
        blocked: { identities: [] },
      },
      {
        blockedUserId: 'u3',
        createdAt: new Date('2026-10-21T09:00:00Z'),
        blockedIdentity: null,
        blocked: {
          identities: [
            {
              type: 'INDIVIDUAL',
              individualData: { name: 'أحمد', avatarUrl: null },
              companyData: null,
              officeData: null,
            },
          ],
        },
      },
    ]);
    await expect(service.list('u1')).resolves.toEqual([
      {
        userId: 'u2',
        name: 'شركة',
        avatarUrl: 'logo',
        type: 'COMPANY',
        blockedAt: '2026-10-21T10:00:00.000Z',
      },
      {
        userId: 'u3',
        name: 'أحمد',
        avatarUrl: null,
        type: 'INDIVIDUAL',
        blockedAt: '2026-10-21T09:00:00.000Z',
      },
    ]);
  });
});

describe('block rules', () => {
  const db = { userBlock: { findFirst: jest.fn(), findMany: jest.fn() } };

  it('either direction counts as blocked; yourself never', async () => {
    db.userBlock.findFirst.mockResolvedValue({ blockerUserId: 'b' });
    await expect(isBlockedEitherWay(db as never, 'a', 'b')).resolves.toBe(true);
    db.userBlock.findFirst.mockResolvedValue(null);
    await expect(isBlockedEitherWay(db as never, 'a', 'b')).resolves.toBe(
      false,
    );
    db.userBlock.findFirst.mockClear();
    await expect(isBlockedEitherWay(db as never, 'a', 'a')).resolves.toBe(
      false,
    );
    expect(db.userBlock.findFirst).not.toHaveBeenCalled();
  });

  it('the other side of every block, once each', async () => {
    db.userBlock.findMany.mockResolvedValue([
      { blockerUserId: 'a', blockedUserId: 'b' },
      { blockerUserId: 'c', blockedUserId: 'a' },
      { blockerUserId: 'b', blockedUserId: 'a' },
    ]);
    await expect(blockedUserIdsFor(db as never, 'a')).resolves.toEqual([
      'b',
      'c',
    ]);
  });

  it('the SQL keeps the viewer as a parameter', () => {
    const sql = notBlockedSql('viewer-1', Prisma.sql`i."userId"`);
    expect(sql.text).not.toContain('viewer-1');
    expect(sql.values).toEqual(['viewer-1', 'viewer-1']);
  });
});

describe('BlockUserDto', () => {
  const errorsOf = async (plain: object) =>
    (await validate(plainToInstance(BlockUserDto, plain))).map(
      (e) => e.property,
    );
  const id = '11111111-1111-4111-8111-111111111111';

  it('an account, a profile, or both', async () => {
    expect(await errorsOf({ userId: id })).toEqual([]);
    expect(await errorsOf({ identityId: id })).toEqual([]);
    expect(await errorsOf({ userId: id, identityId: id })).toEqual([]);
  });

  it('neither, or ids that are not ids, is refused', async () => {
    expect(await errorsOf({})).toEqual(['userId']);
    expect(await errorsOf({ userId: 'x' })).toEqual(['userId']);
    expect(await errorsOf({ identityId: 'x' })).toEqual(['identityId']);
  });
});
