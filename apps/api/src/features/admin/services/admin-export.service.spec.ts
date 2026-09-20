import { Test, TestingModule } from '@nestjs/testing';
import { AdminExportService } from './admin-export.service';
import { AdminUsersService } from './admin-users.service';
import { Role } from '@prisma/client';

describe('AdminExportService', () => {
  let service: AdminExportService;
  let adminUsersService: { getUsers: jest.Mock };

  beforeEach(async () => {
    adminUsersService = {
      getUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminExportService,
        {
          provide: AdminUsersService,
          useValue: adminUsersService,
        },
      ],
    }).compile();

    service = module.get<AdminExportService>(AdminExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportUsersCsv', () => {
    const mockUsersData = {
      data: [
        {
          id: 'u-1',
          name: 'فهد العتيبي',
          email: 'fahad@example.com',
          phone: '+96599993333',
          accountType: 'فرد',
          verificationStatus: '—',
          subscriptionPlan: 'العادية',
          adsCount: 2,
          accountStatus: 'نشط',
          registrationDate: '10/01/2026',
        },
      ],
      meta: { total: 1, currentPage: 1, limit: 10000, totalPages: 1 },
      stats: { total: 1, active: 1, blocked: 0, suspended: 0 },
      counts: { all: 1, individual: 1, office: 0, company: 0 },
    };

    it('should return CSV with UTF-8 BOM and headers using adminUsersService', async () => {
      adminUsersService.getUsers.mockResolvedValue(mockUsersData);

      const csv = await service.exportUsersCsv({ role: Role.INDIVIDUAL });

      expect(adminUsersService.getUsers).toHaveBeenCalledWith({
        role: Role.INDIVIDUAL,
        page: 1,
        limit: 10000,
      });
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('معرف الفرد');
      expect(csv).toContain('فهد العتيبي');
      expect(csv).toContain('fahad@example.com');
      expect(csv).toContain('"2"');
    });

    it('should support custom getUsersFn callback if provided', async () => {
      const customGetUsers = jest.fn().mockResolvedValue(mockUsersData);

      const csv = await service.exportUsersCsv(
        { role: Role.INDIVIDUAL },
        customGetUsers,
      );

      expect(customGetUsers).toHaveBeenCalledWith({
        role: Role.INDIVIDUAL,
        page: 1,
        limit: 10000,
      });
      expect(adminUsersService.getUsers).not.toHaveBeenCalled();
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('فهد العتيبي');
    });

    it('should escape double quotes and handle null values correctly', async () => {
      adminUsersService.getUsers.mockResolvedValue({
        data: [
          {
            id: 'u-2',
            name: 'شركة "النور" العقارية',
            email: null,
            phone: undefined,
            accountType: 'شركة',
            subscriptionPlan: null,
            adsCount: null,
            accountStatus: 'نشط',
            registrationDate: '15/02/2026',
          },
        ],
        meta: { total: 1, currentPage: 1, limit: 10000, totalPages: 1 },
        stats: { total: 1, active: 1, blocked: 0, suspended: 0 },
        counts: { all: 1, individual: 0, office: 0, company: 1 },
      });

      const csv = await service.exportUsersCsv({});

      expect(csv).toContain('"شركة ""النور"" العقارية"');
      expect(csv).toContain('""'); // null email or phone escaped
    });
  });
});
