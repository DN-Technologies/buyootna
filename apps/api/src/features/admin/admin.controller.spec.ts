import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { UserAccountStatusAction } from './dto/admin-update-status.dto';
import type { Response } from 'express';

interface MockAdminService {
  getUsers: jest.Mock;
  getUserById: jest.Mock;
  createIndividual: jest.Mock;
  exportUsersCsv: jest.Mock;
  updateUserStatus: jest.Mock;
  deleteUser: jest.Mock;
  updateIdentityStatus: jest.Mock;
  sendUserPasswordResetLink: jest.Mock;
  getAvailableCoupons: jest.Mock;
  grantCoupon: jest.Mock;
  grantBulkCoupon: jest.Mock;
}

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: MockAdminService;

  beforeEach(async () => {
    adminService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      createIndividual: jest.fn(),
      exportUsersCsv: jest.fn(),
      updateUserStatus: jest.fn(),
      deleteUser: jest.fn(),
      updateIdentityStatus: jest.fn(),
      sendUserPasswordResetLink: jest.fn(),
      getAvailableCoupons: jest.fn(),
      grantCoupon: jest.fn(),
      grantBulkCoupon: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: adminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

  it('exportUsers should set headers and return CSV string', async () => {
    adminService.exportUsersCsv.mockResolvedValue('csv-content');
    const mockSetHeader = jest.fn();
    const mockRes = {
      setHeader: mockSetHeader,
    } as unknown as Response;

    const result = await controller.exportUsers(
      { role: Role.INDIVIDUAL },
      mockRes,
    );

    expect(adminService.exportUsersCsv).toHaveBeenCalled();
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="buyootna-users.csv"',
    );
    expect(result).toBe('csv-content');
  });

  it('updateUserStatus should forward params and dto', async () => {
    adminService.updateUserStatus.mockResolvedValue({ message: 'Updated' });
    await controller.updateUserStatus('u-1', {
      status: UserAccountStatusAction.ACTIVE,
    });
    expect(adminService.updateUserStatus).toHaveBeenCalledWith('u-1', {
      status: UserAccountStatusAction.ACTIVE,
    });
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

  it('getAvailableCoupons should delegate to service', async () => {
    adminService.getAvailableCoupons.mockReturnValue([
      { id: 'c1', name: 'Byoutna10', code: 'LAUNCHPROMO26', discount: '10%' },
    ]);
    const result = await controller.getAvailableCoupons();
    expect(adminService.getAvailableCoupons).toHaveBeenCalled();
    expect(result[0].code).toBe('LAUNCHPROMO26');
  });

  it('grantCoupon should forward params and dto to service', async () => {
    adminService.grantCoupon.mockResolvedValue({
      message: 'تم اضافة كوبون خصم للمستخدم “على البالي” بنجاح.',
    });
    const dto = { couponCode: 'LAUNCHPROMO26', couponName: 'Byoutna10' };
    const result = await controller.grantCoupon('u-1', dto);
    expect(adminService.grantCoupon).toHaveBeenCalledWith('u-1', dto);
    expect(result.message).toContain('تم اضافة كوبون خصم للمستخدم');
  });

  it('grantBulkCoupon should forward dto to service', async () => {
    adminService.grantBulkCoupon.mockResolvedValue({
      message: 'تم اضافة كوبون خصم لـ 2 مستخدمين بنجاح.',
      grantedCount: 2,
    });
    const dto = {
      userIds: ['u-1', 'u-2'],
      couponCode: 'LAUNCHPROMO26',
      couponName: 'Byoutna10',
    };
    const result = await controller.grantBulkCoupon(dto);
    expect(adminService.grantBulkCoupon).toHaveBeenCalledWith(dto);
    expect(result.grantedCount).toBe(2);
  });
});


