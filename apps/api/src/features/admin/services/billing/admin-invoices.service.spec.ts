import { Test, TestingModule } from '@nestjs/testing';
import { AdminInvoicesService } from './admin-invoices.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { InvoicesService } from '../../../invoices/invoices.service';

describe('AdminInvoicesService', () => {
  let service: AdminInvoicesService;
  let prisma: { adminActionLog: { findMany: jest.Mock } };
  let invoicesService: { findUserInvoices: jest.Mock };

  beforeEach(async () => {
    prisma = {
      adminActionLog: { findMany: jest.fn().mockResolvedValue([]) },
    };
    invoicesService = {
      findUserInvoices: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminInvoicesService,
        { provide: PrismaService, useValue: prisma },
        { provide: InvoicesService, useValue: invoicesService },
      ],
    }).compile();

    service = module.get<AdminInvoicesService>(AdminInvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInvoicesForUser', () => {
    it('delegates to InvoicesService.findUserInvoices', async () => {
      await service.getInvoicesForUser('user-1');
      expect(invoicesService.findUserInvoices).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getCouponHistoryForUser', () => {
    it('queries AdminActionLog scoped to coupon actions for the user', async () => {
      await service.getCouponHistoryForUser('user-1');
      expect(prisma.adminActionLog.findMany).toHaveBeenCalledWith({
        where: {
          targetUserId: 'user-1',
          action: { in: ['COUPON_GRANTED', 'COUPON_BULK_GRANTED'] },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('maps metadata into a flat coupon history row', async () => {
      prisma.adminActionLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          metadata: { couponCode: 'PROMO10', couponName: 'Byoutna10' },
          createdAt: new Date('2026-09-01T00:00:00Z'),
        },
      ]);

      const result = await service.getCouponHistoryForUser('user-1');

      expect(result).toEqual([
        {
          id: 'log-1',
          couponCode: 'PROMO10',
          couponName: 'Byoutna10',
          grantedAt: '2026-09-01T00:00:00.000Z',
        },
      ]);
    });

    it('falls back to empty strings when metadata is missing fields', async () => {
      prisma.adminActionLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          metadata: null,
          createdAt: new Date('2026-09-01T00:00:00Z'),
        },
      ]);

      const result = await service.getCouponHistoryForUser('user-1');

      expect(result[0].couponCode).toBe('');
      expect(result[0].couponName).toBe('');
    });
  });
});
