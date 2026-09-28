import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminPlansService } from './admin-plans.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PlansService } from '../../../plans/plans.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';

describe('AdminPlansService', () => {
  let service: AdminPlansService;
  let prisma: {
    plan: { findUnique: jest.Mock; findFirst: jest.Mock };
    userPlanSlot: { create: jest.Mock; findFirst: jest.Mock };
    identity: { findMany: jest.Mock; findFirst: jest.Mock };
  };
  let plansService: { getAccountWallet: jest.Mock };
  let notifications: { create: jest.Mock };
  let auditLog: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      plan: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'plan-1',
          name: 'الباقة الذهبية',
          maxActiveAds: 5,
        }),
        findFirst: jest.fn().mockResolvedValue({ id: 'default-plan' }),
      },
      userPlanSlot: {
        create: jest.fn().mockResolvedValue({ id: 'slot-1' }),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      // The account's personas: credits land on the individual by default
      identity: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'identity-company', type: 'COMPANY' },
          { id: 'identity-individual', type: 'INDIVIDUAL' },
        ]),
        findFirst: jest.fn().mockResolvedValue({ id: 'identity-company' }),
      },
    };
    plansService = {
      getAccountWallet: jest.fn().mockResolvedValue({ freeAdsRemaining: 0 }),
    };
    notifications = { create: jest.fn().mockResolvedValue({ id: 'notif-1' }) };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPlansService,
        { provide: PrismaService, useValue: prisma },
        { provide: PlansService, useValue: plansService },
        { provide: NotificationsService, useValue: notifications },
        { provide: AdminAuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminPlansService>(AdminPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWallet', () => {
    it("returns the whole account's wallet (every persona)", async () => {
      await service.getWallet('user-1');
      expect(plansService.getAccountWallet).toHaveBeenCalledWith('user-1');
    });
  });

  describe('changePlan', () => {
    it('throws NotFoundException when the plan does not exist', async () => {
      prisma.plan.findUnique.mockResolvedValue(null);
      await expect(
        service.changePlan('user-1', { planId: 'missing' }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates a new active slot defaulting adsRemaining to the plan max', async () => {
      await service.changePlan('user-1', { planId: 'plan-1' }, 'admin-1');

      expect(prisma.userPlanSlot.create).toHaveBeenCalledWith({
        data: {
          planId: 'plan-1',
          identityId: 'identity-individual',
          userId: 'user-1',
          adsRemaining: 5,
          status: 'ACTIVE',
        },
      });
    });

    it('credits the persona the admin picked, if it belongs to the user', async () => {
      await service.changePlan(
        'user-1',
        { planId: 'plan-1', identityId: 'identity-company' },
        'admin-1',
      );

      expect(prisma.identity.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'identity-company', userId: 'user-1' },
        }),
      );
      const [createArg] = prisma.userPlanSlot.create.mock.calls[0] as [
        { data: { identityId: string } },
      ];
      expect(createArg.data.identityId).toBe('identity-company');
    });

    it("refuses a persona that isn't the user's", async () => {
      prisma.identity.findFirst.mockResolvedValue(null);
      await expect(
        service.changePlan(
          'user-1',
          { planId: 'plan-1', identityId: 'someone-else' },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.userPlanSlot.create).not.toHaveBeenCalled();
    });

    it('honors an explicit adsRemaining override', async () => {
      await service.changePlan(
        'user-1',
        { planId: 'plan-1', adsRemaining: 2 },
        'admin-1',
      );

      expect(prisma.userPlanSlot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ adsRemaining: 2 }),
        }),
      );
    });

    it('logs PLAN_CHANGED against the user', async () => {
      await service.changePlan('user-1', { planId: 'plan-1' }, 'admin-1');

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'PLAN_CHANGED',
          targetUserId: 'user-1',
        }),
      );
    });
  });

  describe('grantExceptionalFeature', () => {
    it('creates a slot with adsCount when provided, reusing the current plan', async () => {
      prisma.userPlanSlot.findFirst.mockResolvedValue({ planId: 'plan-9' });

      await service.grantExceptionalFeature(
        'user-1',
        { adsCount: 3 },
        'admin-1',
      );

      expect(prisma.userPlanSlot.create).toHaveBeenCalledWith({
        data: {
          planId: 'plan-9',
          identityId: 'identity-individual',
          userId: 'user-1',
          adsRemaining: 3,
          status: 'ACTIVE',
        },
      });
    });

    it('falls back to the default active plan when the user has no slot history', async () => {
      await service.grantExceptionalFeature(
        'user-1',
        { adsCount: 3 },
        'admin-1',
      );

      expect(prisma.userPlanSlot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ planId: 'default-plan' }),
        }),
      );
    });

    it('does not create a slot when adsCount is not provided', async () => {
      await service.grantExceptionalFeature('user-1', {}, 'admin-1');
      expect(prisma.userPlanSlot.create).not.toHaveBeenCalled();
    });

    it('best-effort notifies when notifyEmail or notifyApp is set', async () => {
      await service.grantExceptionalFeature(
        'user-1',
        { notifyEmail: true },
        'admin-1',
      );
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
      );
    });

    it('does not notify when neither channel is requested', async () => {
      await service.grantExceptionalFeature('user-1', {}, 'admin-1');
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('logs EXCEPTIONAL_FEATURE_GRANTED with the form fields as metadata', async () => {
      await service.grantExceptionalFeature(
        'user-1',
        { photosCount: 10, priorityVisibility: true },
        'admin-1',
      );

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'EXCEPTIONAL_FEATURE_GRANTED',
          targetUserId: 'user-1',
          metadata: expect.objectContaining({
            photosCount: 10,
            priorityVisibility: true,
          }),
        }),
      );
    });
  });
});
