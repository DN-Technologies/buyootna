import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { Role } from '@prisma/client';
import { UserAccountStatusAction } from '../dto/admin-update-status.dto';
import { AdminUsersController } from './admin-users.controller';
import { setupAdminControllers } from './admin.controller.harness';

const ADMIN_REQ_USER = { userId: 'admin-1' } as RequestUser;

describe('AdminUsersController', () => {
  const harness = setupAdminControllers();
  let controller: AdminUsersController;
  let adminService: typeof harness.adminService;
  beforeEach(() => {
    controller = harness.get(AdminUsersController);
    adminService = harness.adminService;
  });

  it('getVerifications should forward filters to service', async () => {
    const filters = { status: 'PENDING' as const, page: 1, limit: 10 };
    adminService.getVerifications.mockResolvedValue({ data: [] });

    await controller.getVerifications(filters);
    expect(adminService.getVerifications).toHaveBeenCalledWith(filters);
  });

  it('notifyUsers should forward dto to service', async () => {
    const dto = { userIds: ['u-1', 'u-2'], title: 'عنوان', message: 'رسالة' };
    adminService.notifyUsers.mockResolvedValue({
      message: 'تم إرسال الإشعار إلى 2 مستخدم.',
      notifiedCount: 2,
      notifiedUserIds: ['u-1', 'u-2'],
      failedUserIds: [],
    });

    const result = await controller.notifyUsers(ADMIN_REQ_USER, dto);
    expect(adminService.notifyUsers).toHaveBeenCalledWith(dto, 'admin-1');
    expect(result.notifiedCount).toBe(2);
  });

  it('getUsers should forward filters to service', async () => {
    const filters = { role: Role.INDIVIDUAL, page: 1, limit: 10 };
    adminService.getUsers.mockResolvedValue({ data: [] });

    await controller.getUsers(filters);
    expect(adminService.getUsers).toHaveBeenCalledWith(filters);
  });

  it('createIndividual should forward dto to service', async () => {
    const dto = { name: 'عمر المطيري', email: 'omar@example.com' };
    adminService.createIndividual.mockResolvedValue({ message: 'Success' });

    const result = await controller.createIndividual(dto);
    expect(adminService.createIndividual).toHaveBeenCalledWith(dto);
    expect(result.message).toBe('Success');
  });

  it('updateUserStatus should forward params, dto and adminUserId', async () => {
    adminService.updateUserStatus.mockResolvedValue({ message: 'Updated' });
    await controller.updateUserStatus(ADMIN_REQ_USER, 'u-1', {
      status: UserAccountStatusAction.ACTIVE,
    });
    expect(adminService.updateUserStatus).toHaveBeenCalledWith(
      'u-1',
      { status: UserAccountStatusAction.ACTIVE },
      'admin-1',
    );
  });

  it('deleteUser should forward id to service', async () => {
    adminService.deleteUser.mockResolvedValue({ message: 'Deleted' });
    await controller.deleteUser('u-1');
    expect(adminService.deleteUser).toHaveBeenCalledWith('u-1');
  });

  it('sendUserPasswordResetLink should forward id to service', async () => {
    adminService.sendUserPasswordResetLink.mockResolvedValue({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح',
      email: 'user@example.com',
    });
    const result = await controller.sendUserPasswordResetLink('u-1');
    expect(adminService.sendUserPasswordResetLink).toHaveBeenCalledWith('u-1');
    expect(result.email).toBe('user@example.com');
  });
});
