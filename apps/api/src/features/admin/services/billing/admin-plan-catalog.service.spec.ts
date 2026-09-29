import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { AdminPlanCatalogService } from './admin-plan-catalog.service';

describe('AdminPlanCatalogService', () => {
  const silver = {
    id: 'plan-silver',
    name: 'الفضية',
    price: 5,
    isActive: true,
    maxActiveAds: 1,
    durationDays: 45,
    maxImagesPerAd: 10,
    featuredDays: 5,
    prioritySearch: false,
  };
  let prisma: {
    plan: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    userPlanSlot: { groupBy: jest.Mock };
  };
  let audit: { log: jest.Mock };
  let service: AdminPlanCatalogService;

  beforeEach(() => {
    prisma = {
      plan: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { ...silver, packages: [], _count: { slots: 12 } },
          ]),
        findUnique: jest.fn().mockResolvedValue(silver),
        update: jest.fn((args: { data: object }) =>
          Promise.resolve({ ...silver, ...args.data }),
        ),
      },
      userPlanSlot: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ planId: 'plan-silver', _count: { _all: 3 } }]),
      },
    };
    audit = { log: jest.fn() };
    service = new AdminPlanCatalogService(
      prisma as unknown as PrismaService,
      audit as unknown as AdminAuditLogService,
    );
  });

  it('lists every plan with how often it was bought, in total and this month', async () => {
    const [plan] = await service.list();
    expect(plan).toMatchObject({
      id: 'plan-silver',
      subscriptionsCount: 12,
      subscriptionsThisMonth: 3,
    });
    expect(plan).not.toHaveProperty('_count');
    // Hidden plans are listed too (no isActive filter)
    expect(prisma.plan.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({ where: expect.anything() }),
    );
  });

  it('saves the changes and records who made them, with the values before', async () => {
    const updated = await service.update(
      'plan-silver',
      { price: 7, isActive: false, durationDays: 60 },
      'admin-1',
    );
    expect(updated).toMatchObject({
      price: 7,
      isActive: false,
      durationDays: 60,
    });
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorAdminId: 'admin-1',
        action: 'PLAN_UPDATED',
        targetId: 'plan-silver',
        metadata: expect.objectContaining({
          before: expect.objectContaining({ price: 5, isActive: true }),
        }) as unknown,
      }),
    );
  });

  it('refuses an unknown plan', async () => {
    prisma.plan.findUnique.mockResolvedValue(null);
    await expect(
      service.update('nope', { price: 1 }, 'admin-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.plan.update).not.toHaveBeenCalled();
  });
});
