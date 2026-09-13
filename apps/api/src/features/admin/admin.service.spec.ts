import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Role, IdentityType } from '@prisma/client';
import { UserAccountStatusAction } from './dto/admin-update-status.dto';

interface MockPrismaService {
  user: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  individualProfile: {
    create: jest.Mock;
  };
  identity: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  companyIdentityData: {
    update: jest.Mock;
  };
  officeIdentityData: {
    update: jest.Mock;
  };
  plan: {
    findFirst: jest.Mock;
  };
  $transaction: jest.Mock;
}

interface MockNotificationsService {
  create: jest.Mock;
}

describe('AdminService', () => {
  let service: AdminService;
  let prisma: MockPrismaService;
  let notifications: MockNotificationsService;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      individualProfile: {
        create: jest.fn(),
      },
      identity: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      companyIdentityData: {
        update: jest.fn(),
      },
      officeIdentityData: {
        update: jest.fn(),
      },
      plan: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(
        (callback: (tx: MockPrismaService) => Promise<unknown>) =>
          callback(prisma),
      ),
    };

    notifications = {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: NotificationsService,
          useValue: notifications,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should calculate adsCount and scope stats when role is INDIVIDUAL', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'علي حسن',
          email: 'ali@example.com',
          phone: '+96599991111',
          role: Role.INDIVIDUAL,
          isDisabled: false,
          isBlocked: false,
          createdAt: new Date('2026-01-15T10:00:00Z'),
          activePlan: { name: 'الفضية' },
          identities: [
            {
              type: 'INDIVIDUAL',
              individualData: { name: 'علي حسن' },
              _count: { properties: 4 },
            },
          ],
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      // Mock counts: totalCount, totalUsers, totalActive, totalBlocked, totalSuspended, countIndividual, countOffice, countCompany
      prisma.user.count
        .mockResolvedValueOnce(1) // where
        .mockResolvedValueOnce(1) // total role
        .mockResolvedValueOnce(1) // active role
        .mockResolvedValueOnce(0) // blocked role
        .mockResolvedValueOnce(0) // suspended role
        .mockResolvedValueOnce(1) // Role.INDIVIDUAL
        .mockResolvedValueOnce(0) // Role.OFFICE
        .mockResolvedValueOnce(0); // Role.COMPANY

      const result = await service.getUsers({
        role: Role.INDIVIDUAL,
        subscriptionPlan: 'الفضية',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].adsCount).toBe(4);
      expect(result.data[0].subscriptionPlan).toBe('الفضية');
      expect(result.data[0].accountType).toBe('فرد');
      expect(result.stats.total).toBe(1);
      expect(result.stats.active).toBe(1);
      expect(result.counts.individual).toBe(1);
    });
  });

  describe('createIndividual', () => {
    it('should throw BadRequestException if neither email nor phone is provided', async () => {
      await expect(
        service.createIndividual({
          name: 'محمد أحمد',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create individual user, profile, and identity in a transaction', async () => {
      prisma.user.findFirst.mockResolvedValue(null); // No collision

      const createdUser = {
        id: 'new-user-1',
        name: 'سالم الكندري',
        email: 'salem@example.com',
        phone: '+96599992222',
        role: Role.INDIVIDUAL,
        password: 'hashed-password',
      };

      prisma.user.create.mockResolvedValue(createdUser);
      prisma.individualProfile.create.mockResolvedValue({ id: 'prof-1' });
      prisma.identity.create.mockResolvedValue({
        id: 'ident-1',
        type: IdentityType.INDIVIDUAL,
      });

      const res = await service.createIndividual({
        name: 'سالم الكندري',
        email: 'salem@example.com',
        phone: '+96599992222',
        password: 'Password123!',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.individualProfile.create).toHaveBeenCalled();
      expect(prisma.identity.create).toHaveBeenCalled();
      expect(res.user.id).toBe('new-user-1');
      expect((res.user as { password?: string }).password).toBeUndefined();
    });
  });

  describe('updateUserStatus', () => {
    it('should block a user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        isBlocked: false,
        password: 'hash',
      });
      prisma.user.update.mockResolvedValue({
        id: 'u-1',
        isBlocked: true,
        password: 'hash',
      });

      const res = await service.updateUserStatus('u-1', {
        status: UserAccountStatusAction.BLOCKED,
      });

      expect(res.user.isBlocked).toBe(true);
      expect((res.user as { password?: string }).password).toBeUndefined();
    });

    it('should throw BadRequestException if trying to update status of an admin user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        isAdmin: true,
      });

      await expect(
        service.updateUserStatus('admin-id', {
          status: UserAccountStatusAction.SUSPENDED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.updateUserStatus('missing-id', {
          status: UserAccountStatusAction.ACTIVE,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should throw BadRequestException if trying to delete an admin user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        isAdmin: true,
      });

      await expect(service.deleteUser('admin-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete non-admin user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        isAdmin: false,
      });
      prisma.user.delete.mockResolvedValue({ id: 'user-id' });

      const res = await service.deleteUser('user-id');
      expect(res.message).toBe('تم حذف المستخدم بنجاح');
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });
  });

  describe('exportUsersCsv', () => {
    it('should return CSV with UTF-8 BOM and headers', async () => {
      jest.spyOn(service, 'getUsers').mockResolvedValue({
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
      });

      const csv = await service.exportUsersCsv({ role: Role.INDIVIDUAL });

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('معرف الفرد');
      expect(csv).toContain('فهد العتيبي');
      expect(csv).toContain('fahad@example.com');
      expect(csv).toContain('"2"');
    });
  });
});
