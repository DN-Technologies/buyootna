import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let prisma: {
    user: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    invoice: {
      aggregate: jest.Mock;
      findMany: jest.Mock;
    };
    companyIdentityData: {
      findMany: jest.Mock;
    };
    officeIdentityData: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      invoice: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      companyIdentityData: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      officeIdentityData: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('computes metrics, usersByType, recent registrations, and pending verifications', async () => {
      // user.count call order: totalUsersNow, totalUsersLastMonth,
      // trialAccountsNow, trialAccountsLastMonth, countIndividual,
      // countCompany, countOffice
      prisma.user.count
        .mockResolvedValueOnce(120) // totalUsersNow
        .mockResolvedValueOnce(100) // totalUsersLastMonth
        .mockResolvedValueOnce(80) // trialAccountsNow
        .mockResolvedValueOnce(70) // trialAccountsLastMonth
        .mockResolvedValueOnce(90) // countIndividual
        .mockResolvedValueOnce(20) // countCompany
        .mockResolvedValueOnce(10); // countOffice

      prisma.invoice.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 500 } }) // this month
        .mockResolvedValueOnce({ _sum: { amount: 250 } }); // last month

      prisma.user.findMany.mockResolvedValue([
        {
          id: 'u-1',
          name: 'سالم الكندري',
          email: 'salem@example.com',
          phone: null,
          role: Role.COMPANY,
          createdAt: new Date('2026-02-01T00:00:00Z'),
          activePlan: { name: 'الفضية' },
        },
      ]);

      prisma.companyIdentityData.findMany.mockResolvedValue([
        { identityId: 'company-identity-1', name: 'شركة الاختبار' },
      ]);
      prisma.officeIdentityData.findMany.mockResolvedValue([
        { identityId: 'office-identity-1', name: 'مكتب الاختبار' },
      ]);

      const result = await service.getDashboard();

      expect(result.metrics.totalUsers).toBe(120);
      expect(result.metrics.totalUsersChangePct).toBe(20);
      expect(result.metrics.trialAccounts).toBe(80);
      expect(result.metrics.revenueTotal).toBe(500);
      expect(result.metrics.revenueChangePct).toBe(100);

      expect(result.usersByType).toEqual({
        individual: 90,
        company: 20,
        office: 10,
      });

      expect(result.recentRegistrations).toHaveLength(1);
      expect(result.recentRegistrations[0].accountType).toBe('شركة');
      expect(result.recentRegistrations[0].planName).toBe('الفضية');

      expect(result.pendingVerifications).toEqual([
        { identityId: 'company-identity-1', name: 'شركة الاختبار', type: 'شركة' },
        { identityId: 'office-identity-1', name: 'مكتب الاختبار', type: 'مكتب عقاري' },
      ]);

      expect(result.revenueByMonth).toHaveLength(12);
    });

    it('returns 0% change when the previous period has no data', async () => {
      prisma.user.count
        .mockResolvedValueOnce(5) // totalUsersNow
        .mockResolvedValueOnce(0) // totalUsersLastMonth
        .mockResolvedValueOnce(0) // trialAccountsNow
        .mockResolvedValueOnce(0) // trialAccountsLastMonth
        .mockResolvedValueOnce(0) // countIndividual
        .mockResolvedValueOnce(0) // countCompany
        .mockResolvedValueOnce(0); // countOffice

      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getDashboard();

      expect(result.metrics.totalUsersChangePct).toBe(0);
      expect(result.metrics.revenueChangePct).toBe(0);
    });
  });
});
