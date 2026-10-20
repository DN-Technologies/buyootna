import { Role } from '@prisma/client';
import type { AdminService } from './admin.service';
import { UserAccountStatusAction } from './dto/admin-update-status.dto';
import { setupAdminService } from './admin.service.harness';

describe('AdminService facade: users, verifications and the dashboard', () => {
  const harness = setupAdminService();
  const {
    adminUsersService,
    adminIdentityService,
    adminExportService,
    adminPasswordService,
    adminDashboardService,
    adminVerificationsService,
    adminReportsService,
  } = harness;
  let service: AdminService;
  beforeEach(() => {
    service = harness.service;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('delegates getDashboard to AdminDashboardService and merges in report stats', async () => {
    adminDashboardService.getDashboard.mockResolvedValue({
      metrics: { totalUsers: 5 },
      usersByType: {},
    });
    adminReportsService.getDashboardReportStats.mockResolvedValue({
      newReportsCount: 3,
    });

    const result = await service.getDashboard();

    expect(adminDashboardService.getDashboard).toHaveBeenCalledTimes(1);
    expect(adminReportsService.getDashboardReportStats).toHaveBeenCalledTimes(
      1,
    );
    expect(result).toEqual({
      metrics: { totalUsers: 5, newReportsCount: 3 },
      usersByType: {},
    });
  });

  it('delegates getVerifications to AdminVerificationsService', async () => {
    const filters = { page: 1, limit: 10 };
    const mockResult = { data: [] };
    adminVerificationsService.getVerifications.mockResolvedValue(mockResult);

    const result = await service.getVerifications(filters);

    expect(adminVerificationsService.getVerifications).toHaveBeenCalledWith(
      filters,
    );
    expect(result).toBe(mockResult);
  });

  it('delegates notifyUsers to AdminUsersService', async () => {
    const dto = { userIds: ['u-1'], title: 'مرحبا', message: 'نص' };
    const mockResult = { notifiedCount: 1 };
    adminUsersService.notifyUsers.mockResolvedValue(mockResult);

    const result = await service.notifyUsers(dto, 'admin-1');

    expect(adminUsersService.notifyUsers).toHaveBeenCalledWith(dto, 'admin-1');
    expect(result).toBe(mockResult);
  });

  it('delegates getUsers to AdminUsersService', async () => {
    const filter = { role: Role.INDIVIDUAL, page: 1, limit: 10 };
    const mockResult = { data: [] };
    adminUsersService.getUsers.mockResolvedValue(mockResult);

    const result = await service.getUsers(filter);

    expect(adminUsersService.getUsers).toHaveBeenCalledWith(filter);
    expect(result).toBe(mockResult);
  });

  it('delegates getUserById to AdminUsersService', async () => {
    const mockUser = { id: 'u-1', name: 'User 1' };
    adminUsersService.getUserById.mockResolvedValue(mockUser);

    const result = await service.getUserById('u-1');

    expect(adminUsersService.getUserById).toHaveBeenCalledWith('u-1');
    expect(result).toBe(mockUser);
  });

  it('delegates updateUserStatus to AdminUsersService', async () => {
    const dto = { status: UserAccountStatusAction.BLOCKED };
    const mockResult = { user: { id: 'u-1', isBlocked: true } };
    adminUsersService.updateUserStatus.mockResolvedValue(mockResult);

    const result = await service.updateUserStatus('u-1', dto, 'admin-1');

    expect(adminUsersService.updateUserStatus).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates updateIdentityStatus to AdminIdentityService', async () => {
    const dto = { status: 'APPROVED' } as any;
    const mockResult = { id: 'ident-1', status: 'APPROVED' };
    adminIdentityService.updateIdentityStatus.mockResolvedValue(mockResult);

    const result = await service.updateIdentityStatus(
      'ident-1',
      dto,
      'admin-1',
    );

    expect(adminIdentityService.updateIdentityStatus).toHaveBeenCalledWith(
      'ident-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates requestIdentityEdit to AdminIdentityService', async () => {
    const dto = { notes: 'يرجى رفع رخصة أوضح' };
    const mockResult = { id: 'req-1' };
    adminIdentityService.requestIdentityEdit.mockResolvedValue(mockResult);

    const result = await service.requestIdentityEdit('ident-1', dto, 'admin-1');

    expect(adminIdentityService.requestIdentityEdit).toHaveBeenCalledWith(
      'ident-1',
      dto,
      'admin-1',
    );
    expect(result).toBe(mockResult);
  });

  it('delegates deleteUser to AdminUsersService', async () => {
    const mockResult = { message: 'تم حذف المستخدم بنجاح' };
    adminUsersService.deleteUser.mockResolvedValue(mockResult);

    const result = await service.deleteUser('u-1');

    expect(adminUsersService.deleteUser).toHaveBeenCalledWith('u-1');
    expect(result).toBe(mockResult);
  });

  it('delegates createIndividual to AdminUsersService', async () => {
    const dto = {
      name: 'علي حسن',
      email: 'ali@example.com',
      password: 'Password123!',
    };
    const mockResult = { user: { id: 'new-u' } };
    adminUsersService.createIndividual.mockResolvedValue(mockResult);

    const result = await service.createIndividual(dto);

    expect(adminUsersService.createIndividual).toHaveBeenCalledWith(dto);
    expect(result).toBe(mockResult);
  });

  it('delegates exportUsersCsv to AdminExportService with callback', async () => {
    const filter = { role: Role.INDIVIDUAL };
    const mockCsv = '\uFEFFheader,row';
    adminExportService.exportUsersCsv.mockImplementation(
      async (f, callback) => {
        if (callback) {
          await callback(f);
        }
        return mockCsv;
      },
    );
    adminUsersService.getUsers.mockResolvedValue({ data: [] });

    const result = await service.exportUsersCsv(filter);

    expect(adminExportService.exportUsersCsv).toHaveBeenCalledWith(
      filter,
      expect.any(Function),
    );
    expect(adminUsersService.getUsers).toHaveBeenCalledWith(filter);
    expect(result).toBe(mockCsv);
  });

  it('delegates sendUserPasswordResetLink to AdminPasswordService', async () => {
    const mockResult = { message: 'تم الإرسال', email: 'test@example.com' };
    adminPasswordService.sendUserPasswordResetLink.mockResolvedValue(
      mockResult,
    );

    const result = await service.sendUserPasswordResetLink('u-1');

    expect(adminPasswordService.sendUserPasswordResetLink).toHaveBeenCalledWith(
      'u-1',
    );
    expect(result).toBe(mockResult);
  });
});
