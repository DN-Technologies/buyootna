import { Test, TestingModule } from '@nestjs/testing';
import { AdminVerificationsService } from './admin-verifications.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

describe('AdminVerificationsService', () => {
  let service: AdminVerificationsService;
  let prisma: {
    companyIdentityData: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
    officeIdentityData: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      companyIdentityData: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      officeIdentityData: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminVerificationsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AdminVerificationsService>(AdminVerificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVerifications', () => {
    const mockCompany = {
      id: 'c-1',
      identityId: 'ident-c-1',
      name: 'شركة الفوز العقارية',
      status: ApprovalStatus.PENDING,
      licenseNumber: 'LIC-12345',
      licenseActivity: 'وساطة عقارية',
      licenseExpiry: '2026-12-31',
      licenseFileUrl: 'https://example.com/license.pdf',
      logoUrl: null,
      createdAt: new Date('2026-03-01T10:00:00Z'),
      updatedAt: new Date('2026-03-01T10:00:00Z'),
      identity: {
        user: {
          id: 'user-c-1',
          email: 'company@example.com',
          phone: '+96599998888',
          isBlocked: false,
          isDisabled: false,
        },
      },
    };

    const mockOffice = {
      id: 'o-1',
      identityId: 'ident-o-1',
      name: 'مكتب الرياض',
      status: ApprovalStatus.APPROVED,
      licenseNumber: 'LIC-67890',
      licenseActivity: 'تسويق عقاري',
      licenseExpiry: '2027-01-01',
      licenseFileUrl: null,
      logoUrl: null,
      createdAt: new Date('2026-03-02T10:00:00Z'),
      updatedAt: new Date('2026-03-02T10:00:00Z'),
      identity: {
        user: {
          id: 'user-o-1',
          email: 'office@example.com',
          phone: '+96599997777',
          isBlocked: true,
          isDisabled: false,
        },
      },
    };

    it('merges companies and offices, sorts, and calculates stats', async () => {
      prisma.companyIdentityData.findMany.mockResolvedValue([mockCompany]);
      prisma.officeIdentityData.findMany.mockResolvedValue([mockOffice]);

      // counts: countAllCompanies, countAllOffices, pendingCompanies, pendingOffices,
      // approvedTodayCompanies, approvedTodayOffices, rejectedTodayCompanies, rejectedTodayOffices
      prisma.companyIdentityData.count
        .mockResolvedValueOnce(5) // countAllCompanies
        .mockResolvedValueOnce(2) // pendingCompanies
        .mockResolvedValueOnce(1) // approvedTodayCompanies
        .mockResolvedValueOnce(0); // rejectedTodayCompanies

      (prisma.officeIdentityData as any).count = jest
        .fn()
        .mockResolvedValueOnce(3) // countAllOffices
        .mockResolvedValueOnce(1) // pendingOffices
        .mockResolvedValueOnce(0) // approvedTodayOffices
        .mockResolvedValueOnce(0); // rejectedTodayOffices

      const result = await service.getVerifications({
        status: 'ALL',
        sortOrder: 'NEWEST',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      // Newest first: mockOffice (March 2) should be first
      expect(result.data[0].identityId).toBe('ident-o-1');
      expect(result.data[0].accountType).toBe('مكتب عقاري');
      expect(result.data[0].status).toBe('موثق');
      expect(result.data[0].accountStatus).toBe('موقوف'); // blocked user
      expect(result.data[0].attachmentsText).toBe('0');
      expect(result.data[0].actionLabel).toBe('عرض');

      // Second: mockCompany (March 1)
      expect(result.data[1].identityId).toBe('ident-c-1');
      expect(result.data[1].accountType).toBe('شركة');
      expect(result.data[1].status).toBe('قيد الانتظار');
      expect(result.data[1].accountStatus).toBe('نشط');
      expect(result.data[1].attachmentsText).toBe('1');
      expect(result.data[1].actionLabel).toBe('مراجعة');

      expect(result.counts.all).toBe(8);
      expect(result.counts.companies).toBe(5);
      expect(result.counts.offices).toBe(3);
      expect(result.stats.pendingCount).toBe(3);
      expect(result.stats.approvedTodayCount).toBe(1);
    });

    it('filters exclusively by accountType when specified', async () => {
      prisma.companyIdentityData.findMany.mockResolvedValue([mockCompany]);
      prisma.officeIdentityData.findMany.mockResolvedValue([]);
      (prisma.officeIdentityData as any).count = jest.fn().mockResolvedValue(0);

      const result = await service.getVerifications({
        accountType: 'شركة',
      });

      expect(prisma.officeIdentityData.findMany).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].accountType).toBe('شركة');
    });
  });
});
