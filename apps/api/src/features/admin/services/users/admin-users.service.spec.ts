import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { MailService } from '../../../../core/mail/mail.service';
import { AdminAuditLogService } from '../audit/admin-audit-log.service';
import { Role, IdentityType } from '@prisma/client';
import { UserAccountStatusAction } from '../../dto/admin-update-status.dto';

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
  session: { deleteMany: jest.Mock };
  individualProfile: {
    create: jest.Mock;
  };
  identity: {
    findUnique: jest.Mock;
    create: jest.Mock;
    groupBy: jest.Mock;
  };
  $transaction: jest.Mock;
}

interface MockNotificationsService {
  create: jest.Mock;
}

interface MockMailService {
  sendMail: jest.Mock;
}

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let prisma: MockPrismaService;
  let notifications: MockNotificationsService;
  let mail: MockMailService;
  let auditLog: { log: jest.Mock };

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
      session: { deleteMany: jest.fn() },
      individualProfile: {
        create: jest.fn(),
      },
      identity: {
        findUnique: jest.fn(),
        create: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(
        (callback: (tx: MockPrismaService) => Promise<unknown>) =>
          callback(prisma),
      ),
    };

    notifications = {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    mail = {
      sendMail: jest.fn().mockResolvedValue({ success: true }),
    };

    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: NotificationsService,
          useValue: notifications,
        },
        {
          provide: MailService,
          useValue: mail,
        },
        {
          provide: AdminAuditLogService,
          useValue: auditLog,
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
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

      // The page is the accounts with the newest profiles, then (none here)
      // accounts without a profile
      prisma.identity.groupBy.mockResolvedValue([{ userId: 'user-1' }]);
      prisma.user.findMany
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce([]);
      prisma.user.count
        .mockResolvedValue(1)
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

  describe('getUsers - individual who added a company persona', () => {
    it('lists them under شركة and filters by identity, not just User.role', async () => {
      prisma.identity.groupBy.mockResolvedValue([{ userId: 'user-2' }]);
      prisma.user.findMany.mockReset();
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 'user-2',
          name: 'سارة',
          email: 'sara@example.com',
          phone: '+96599992222',
          role: Role.INDIVIDUAL,
          isDisabled: false,
          isBlocked: false,
          createdAt: new Date('2026-02-01T10:00:00Z'),
          activePlan: null,
          identities: [
            {
              type: 'INDIVIDUAL',
              individualData: { name: 'سارة' },
              _count: { properties: 0 },
            },
            {
              type: 'COMPANY',
              companyData: { name: 'شركة النور', status: 'PENDING' },
              _count: { properties: 0 },
            },
          ],
        },
      ]);
      prisma.user.findMany.mockResolvedValueOnce([]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({
        role: Role.COMPANY,
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      });

      // The filter picks the accounts whose profiles are ranked
      expect(
        prisma.identity.groupBy.mock.calls[0][0].where.user.AND,
      ).toContainEqual({
        OR: [
          { role: Role.COMPANY },
          { identities: { some: { type: 'COMPANY' } } },
        ],
      });
      expect(result.data[0].accountType).toBe('شركة');
      expect(result.data[0].name).toBe('شركة النور');
      expect(result.data[0].verificationStatus).toBe('قيد الانتظار');
    });

    // QA: under الأفراد the account showed as its company («الصباح»)
    it('shows them as the individual under الأفراد, with both identities', async () => {
      prisma.identity.groupBy.mockResolvedValue([{ userId: 'user-2' }]);
      prisma.user.findMany.mockReset();
      prisma.user.findMany.mockResolvedValueOnce([
        {
          id: 'user-2',
          name: 'سارة',
          email: 'sara@example.com',
          phone: '+96599992222',
          role: Role.INDIVIDUAL,
          isDisabled: false,
          isBlocked: false,
          createdAt: new Date('2026-02-01T10:00:00Z'),
          activePlan: null,
          identities: [
            {
              id: 'ind-1',
              type: 'INDIVIDUAL',
              individualData: { name: 'سارة' },
              _count: { properties: 2 },
            },
            {
              id: 'co-1',
              type: 'COMPANY',
              companyData: { name: 'شركة النور', status: 'PENDING' },
              _count: { properties: 5 },
            },
          ],
        },
      ]);
      prisma.user.findMany.mockResolvedValueOnce([]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({
        role: Role.INDIVIDUAL,
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      });

      expect(result.data[0]).toMatchObject({
        accountType: 'فرد',
        name: 'سارة',
        verificationStatus: '—',
        adsCount: 2,
        identities: [
          { id: 'ind-1', type: 'INDIVIDUAL', name: 'سارة', status: null },
          {
            id: 'co-1',
            type: 'COMPANY',
            name: 'شركة النور',
            status: 'PENDING',
          },
        ],
      });
    });
  });

  // QA: a company added to an older account was "missing" from the admin
  // list -- it sat pages deep, at its account's original date
  describe('getUsers - ordered by the newest profile', () => {
    const user = (id: string, createdAt: string) => ({
      id,
      name: id,
      email: `${id}@example.com`,
      phone: null,
      role: Role.INDIVIDUAL,
      isDisabled: false,
      isBlocked: false,
      createdAt: new Date(createdAt),
      activePlan: null,
      identities: [
        {
          type: 'INDIVIDUAL',
          individualData: { name: id },
          _count: { properties: 0 },
        },
      ],
    });

    it('lists an old account that just added a company before newer accounts', async () => {
      // Ranked by newest profile: the September account added a company today
      prisma.identity.groupBy.mockResolvedValue([
        { userId: 'old-account' },
        { userId: 'new-account' },
      ]);
      // The database returns them in its own order
      prisma.user.findMany.mockReset();
      prisma.user.findMany.mockResolvedValueOnce([
        user('new-account', '2026-10-10T00:00:00Z'),
        user('old-account', '2026-09-20T00:00:00Z'),
      ]);
      prisma.user.count.mockResolvedValue(2);

      const result = await service.getUsers({ page: 1, limit: 2 });

      expect(result.data.map((u: { id: string }) => u.id)).toEqual([
        'old-account',
        'new-account',
      ]);
      expect(prisma.identity.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['userId'],
          orderBy: [{ _max: { createdAt: 'desc' } }, { userId: 'asc' }],
          skip: 0,
          take: 2,
        }),
      );
      // A full page: no second query
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('puts accounts with no profile last, so the pages add up', async () => {
      prisma.identity.groupBy.mockResolvedValue([{ userId: 'with-profile' }]);
      prisma.user.findMany.mockReset();
      prisma.user.findMany
        .mockResolvedValueOnce([user('with-profile', '2026-10-01T00:00:00Z')])
        .mockResolvedValueOnce([
          { ...user('no-profile', '2026-08-01T00:00:00Z'), identities: [] },
        ]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, limit: 10 });

      expect(result.data.map((u: { id: string }) => u.id)).toEqual([
        'with-profile',
        'no-profile',
      ]);
      expect(prisma.user.findMany.mock.calls[1][0]).toMatchObject({
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 9,
      });
    });

    it('keeps sorting by name as it was', async () => {
      prisma.user.findMany.mockReset();
      prisma.user.findMany.mockResolvedValueOnce([
        user('a', '2026-10-01T00:00:00Z'),
      ]);
      prisma.user.count.mockResolvedValue(1);

      await service.getUsers({ sortBy: 'name', sortOrder: 'asc' });

      expect(prisma.identity.groupBy).not.toHaveBeenCalled();
      expect(prisma.user.findMany.mock.calls[0][0].orderBy).toEqual({
        name: 'asc',
      });
    });
  });

  describe('getUserById', () => {
    it('should throw NotFoundException if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user without password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'علي حسن',
        password: 'hashed-password',
        identities: [],
        activePlan: null,
      });

      const user = await service.getUserById('user-1');
      expect(user.id).toBe('user-1');
      expect((user as { password?: string }).password).toBeUndefined();
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
      prisma.user.findFirst.mockResolvedValue(null);

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

    it('should derive name from email or phone when name is omitted', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'user-derived', ...data }),
      );
      prisma.individualProfile.create.mockResolvedValue({ id: 'prof-2' });
      prisma.identity.create.mockResolvedValue({
        id: 'ident-2',
        type: IdentityType.INDIVIDUAL,
      });

      const res = await service.createIndividual({
        email: 'alisalem@example.com',
        password: 'Password123!',
      });

      expect(res.user.name).toBe('alisalem');
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

      const res = await service.updateUserStatus(
        'u-1',
        { status: UserAccountStatusAction.BLOCKED },
        'admin-1',
      );

      expect(res.user.isBlocked).toBe(true);
      expect((res.user as { password?: string }).password).toBeUndefined();
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'USER_STATUS_CHANGED',
          targetType: 'USER',
          targetId: 'u-1',
          targetUserId: 'u-1',
          metadata: { status: UserAccountStatusAction.BLOCKED },
        }),
      );
    });

    it('suspending an account the user had deactivated makes it an admin suspension and signs every device out', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        isDisabled: true,
        suspendedAt: new Date(),
        suspendedUntil: new Date(),
      });
      prisma.user.update.mockResolvedValue({ id: 'u-1', isDisabled: true });

      await service.updateUserStatus(
        'u-1',
        { status: UserAccountStatusAction.SUSPENDED },
        'admin-1',
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { isDisabled: true, suspendedAt: null, suspendedUntil: null },
      });
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
      });
    });

    it('reactivating keeps the sessions', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u-1', isDisabled: true });
      prisma.user.update.mockResolvedValue({ id: 'u-1' });

      await service.updateUserStatus(
        'u-1',
        { status: UserAccountStatusAction.ACTIVE },
        'admin-1',
      );

      expect(prisma.session.deleteMany).not.toHaveBeenCalled();
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
    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

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

  describe('notifyUsers', () => {
    it('notifies every existing user via both channels by default', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u-1', email: 'a@example.com', name: 'أحمد' },
        { id: 'u-2', email: 'b@example.com', name: 'سارة' },
      ]);

      const res = await service.notifyUsers(
        {
          userIds: ['u-1', 'u-2'],
          title: 'تنبيه هام',
          message: 'يرجى تحديث بيانات حسابك.',
        },
        'admin-1',
      );

      expect(notifications.create).toHaveBeenCalledTimes(2);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u-1',
          type: 'ADMIN_CUSTOM_MESSAGE',
          title: 'تنبيه هام',
        }),
      );
      expect(mail.sendMail).toHaveBeenCalledTimes(2);
      expect(res.notifiedCount).toBe(2);
      expect(res.failedUserIds).toEqual([]);
      expect(auditLog.log).toHaveBeenCalledTimes(2);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          actorAdminId: 'admin-1',
          action: 'USER_NOTIFIED',
          targetType: 'USER',
          targetId: 'u-1',
          targetUserId: 'u-1',
        }),
      );
    });

    it('reports missing users as failed without failing the whole batch', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u-1', email: 'a@example.com', name: 'أحمد' },
      ]);

      const res = await service.notifyUsers({
        userIds: ['u-1', 'missing-id'],
        title: 'تنبيه',
        message: 'رسالة',
      });

      expect(res.notifiedCount).toBe(1);
      expect(res.failedUserIds).toEqual(['missing-id']);
    });

    it('skips the in-app notification when notifyInApp is false', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u-1', email: 'a@example.com', name: 'أحمد' },
      ]);

      await service.notifyUsers({
        userIds: ['u-1'],
        title: 'تنبيه',
        message: 'رسالة',
        notifyInApp: false,
      });

      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('skips the email when notifyEmail is false', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u-1', email: 'a@example.com', name: 'أحمد' },
      ]);

      await service.notifyUsers({
        userIds: ['u-1'],
        title: 'تنبيه',
        message: 'رسالة',
        notifyEmail: false,
      });

      expect(mail.sendMail).not.toHaveBeenCalled();
    });

    it('still counts the user as notified when only the email fails', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'u-1', email: 'a@example.com', name: 'أحمد' },
      ]);
      mail.sendMail.mockRejectedValueOnce(new Error('Invalid `to` field'));

      const res = await service.notifyUsers({
        userIds: ['u-1'],
        title: 'تنبيه',
        message: 'رسالة',
      });

      expect(res.notifiedCount).toBe(1);
      expect(res.failedUserIds).toEqual([]);
    });
  });
});
