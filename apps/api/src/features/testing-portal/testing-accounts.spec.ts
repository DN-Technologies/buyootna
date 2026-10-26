import { BadRequestException, ConflictException } from '@nestjs/common';
import { OtpRateLimiterService } from '../../core/otp-rate-limiter/otp-rate-limiter.service';
import { TestingAccountsService } from './testing-accounts.service';

const actor = { tester: { name: 'Ahmed (QA)' }, ip: '1.2.3.4' };

function setup() {
  const prisma = {
    user: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    identity: { findUnique: jest.fn(), update: jest.fn() },
    plan: { findUnique: jest.fn(), findMany: jest.fn() },
    userPlanSlot: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const limiter = { entries: jest.fn().mockReturnValue([]), reset: jest.fn() };
  const adminUsers = { createIndividual: jest.fn() };
  const identities = { createProviderPersonaInTx: jest.fn() };
  const plans = { getWallet: jest.fn().mockResolvedValue({ slots: [] }) };
  const audit = { record: jest.fn() };
  const service = new TestingAccountsService(
    prisma as never,
    limiter as never,
    adminUsers as never,
    identities as never,
    plans as never,
    audit as never,
  );
  return { service, prisma, limiter, adminUsers, identities, plans, audit };
}

describe('TestingAccountsService', () => {
  it("doesn't search with fewer than 2 characters", async () => {
    const { service, prisma } = setup();
    expect(await service.search(' a ')).toEqual({ data: [] });
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('removes the new account when its company or office can’t be made', async () => {
    const { service, prisma, adminUsers } = setup();
    adminUsers.createIndividual.mockResolvedValue({ user: { id: 'u1' } });
    prisma.$transaction.mockRejectedValue(
      new ConflictException('رقم الترخيص مسجل مسبقاً'),
    );

    await expect(
      service.createAccount(
        {
          name: 'Dup',
          email: 'dup@x.com',
          password: 'password123',
          persona: { type: 'COMPANY', name: 'شركة', licenseNumber: 'L-1' },
        },
        actor,
      ),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('grants a plan with its own ad count by default, and records it', async () => {
    const { service, prisma, audit } = setup();
    prisma.identity.findUnique.mockResolvedValue({ id: 'i1', userId: 'u1' });
    prisma.plan.findUnique.mockResolvedValue({
      id: 'p1',
      name: 'الذهبية',
      maxActiveAds: 5,
    });
    prisma.userPlanSlot.create.mockResolvedValue({ adsRemaining: 5 });

    await service.grantPlan('i1', 'p1', undefined, actor);

    expect(prisma.userPlanSlot.create).toHaveBeenCalledWith({
      data: {
        planId: 'p1',
        identityId: 'i1',
        userId: 'u1',
        adsRemaining: 5,
        status: 'ACTIVE',
      },
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PLAN_GRANTED',
        actorName: 'Ahmed (QA)',
        target: 'i1',
      }),
    );
  });

  it('records a slot edit with before and after', async () => {
    const { service, prisma, audit } = setup();
    prisma.userPlanSlot.findUnique.mockResolvedValue({
      id: 's1',
      identityId: 'i1',
      adsRemaining: 5,
      status: 'ACTIVE',
    });
    prisma.userPlanSlot.update.mockResolvedValue({
      adsRemaining: 0,
      status: 'EXHAUSTED',
    });

    await service.editSlot(
      's1',
      { adsRemaining: 0, status: 'EXHAUSTED' },
      actor,
    );

    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PLAN_EDITED',
        metadata: {
          slotId: 's1',
          from: { adsRemaining: 5, status: 'ACTIVE' },
          to: { adsRemaining: 0, status: 'EXHAUSTED' },
        },
      }),
    );
    await expect(service.editSlot('s1', {}, actor)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('unlocks a cooldown and records it', async () => {
    const { service, limiter, audit } = setup();
    await service.unlock('55556666', actor);
    expect(limiter.reset).toHaveBeenCalledWith('55556666');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'OTP_COOLDOWN_UNLOCKED',
        target: '55556666',
      }),
    );
  });

  it('turns a demo failure (no individual profile) into a 400', async () => {
    const { service, prisma } = setup();
    // findMe finds no individual profile on the account
    (
      prisma as unknown as { identity: { findMany: jest.Mock } }
    ).identity.findMany = jest.fn().mockResolvedValue([]);
    await expect(
      service.runDemo('u1', 'all', undefined, actor),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('OtpRateLimiterService.entries', () => {
  it('lists cooldowns by key with the wait and the daily count', () => {
    const limiter = new OtpRateLimiterService();
    limiter.recordRequest('a@b.com');
    limiter.recordRequest('a@b.com');
    limiter.recordVerifyAttempt('a@b.com', false);

    const [entry] = limiter.entries('A@B');
    expect(entry).toMatchObject({
      key: 'a@b.com',
      requestsToday: 2,
      failedAttempts: 1,
      blocked: false,
    });
    expect(entry.waitUntil).not.toBeNull();
    expect(limiter.entries('nobody')).toEqual([]);
    limiter.onModuleDestroy();
  });
});
