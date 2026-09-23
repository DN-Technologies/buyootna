import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { UserAccountStatusAction } from './dto/admin-update-status.dto';
import type { Response } from 'express';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

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
  getVerifications: jest.Mock;
  notifyUsers: jest.Mock;
  getReports: jest.Mock;
  getReportById: jest.Mock;
  updateReport: jest.Mock;
  resolveReports: jest.Mock;
  dismissReports: jest.Mock;
  getReportsForUser: jest.Mock;
  getReportsForProperty: jest.Mock;
  removeReportedProperty: jest.Mock;
  updateProperty: jest.Mock;
  getRequestsForUser: jest.Mock;
  getProjectsForUser: jest.Mock;
  deleteProject: jest.Mock;
  getWallet: jest.Mock;
  changePlan: jest.Mock;
  grantExceptionalFeature: jest.Mock;
  getInvoicesForUser: jest.Mock;
  getCouponHistoryForUser: jest.Mock;
  getReviewsForUser: jest.Mock;
  getReviewsSummaryForUser: jest.Mock;
  deleteReview: jest.Mock;
  getNotesForUser: jest.Mock;
  createNote: jest.Mock;
  updateNote: jest.Mock;
  deleteNote: jest.Mock;
  getAssignableAdmins: jest.Mock;
}

const ADMIN_REQ_USER = { userId: 'admin-1' } as RequestUser;

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
      getVerifications: jest.fn(),
      notifyUsers: jest.fn(),
      getReports: jest.fn(),
      getReportById: jest.fn(),
      updateReport: jest.fn(),
      resolveReports: jest.fn(),
      dismissReports: jest.fn(),
      getReportsForUser: jest.fn(),
      getReportsForProperty: jest.fn(),
      removeReportedProperty: jest.fn(),
      updateProperty: jest.fn(),
      getRequestsForUser: jest.fn(),
      getProjectsForUser: jest.fn(),
      deleteProject: jest.fn(),
      getWallet: jest.fn(),
      changePlan: jest.fn(),
      grantExceptionalFeature: jest.fn(),
      getInvoicesForUser: jest.fn(),
      getCouponHistoryForUser: jest.fn(),
      getReviewsForUser: jest.fn(),
      getReviewsSummaryForUser: jest.fn(),
      deleteReview: jest.fn(),
      getNotesForUser: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      getAssignableAdmins: jest.fn(),
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

  it('getReports should forward filters to service', async () => {
    const filters = { status: 'PENDING' as const, page: 1, limit: 10 };
    adminService.getReports.mockResolvedValue({ data: [] });

    await controller.getReports(filters);
    expect(adminService.getReports).toHaveBeenCalledWith(filters);
  });

  it('getReportById should forward id to service', async () => {
    adminService.getReportById.mockResolvedValue({ id: 'rep-1' });
    const result = await controller.getReportById('rep-1');
    expect(adminService.getReportById).toHaveBeenCalledWith('rep-1');
    expect(result.id).toBe('rep-1');
  });

  it('updateReport should forward reqUser, id, and dto to service', async () => {
    const dto = { status: 'RESOLVED' as const };
    adminService.updateReport.mockResolvedValue({ id: 'rep-1' });

    await controller.updateReport(ADMIN_REQ_USER, 'rep-1', dto);
    expect(adminService.updateReport).toHaveBeenCalledWith(
      'rep-1',
      dto,
      'admin-1',
    );
  });

  it('bulkResolveReports should forward reqUser and ids to service', async () => {
    adminService.resolveReports.mockResolvedValue({ updatedCount: 2 });

    await controller.bulkResolveReports(ADMIN_REQ_USER, {
      ids: ['rep-1', 'rep-2'],
    });
    expect(adminService.resolveReports).toHaveBeenCalledWith(
      ['rep-1', 'rep-2'],
      'admin-1',
    );
  });

  it('bulkDismissReports should forward reqUser and ids to service', async () => {
    adminService.dismissReports.mockResolvedValue({ updatedCount: 1 });

    await controller.bulkDismissReports(ADMIN_REQ_USER, { ids: ['rep-1'] });
    expect(adminService.dismissReports).toHaveBeenCalledWith(
      ['rep-1'],
      'admin-1',
    );
  });

  it('getReportsForUser should forward id and filters to service', async () => {
    const filters = { page: 1, limit: 10 };
    adminService.getReportsForUser.mockResolvedValue({ data: [] });

    await controller.getReportsForUser('u-1', filters);
    expect(adminService.getReportsForUser).toHaveBeenCalledWith('u-1', filters);
  });

  it('getReportsForProperty should forward id to service', async () => {
    adminService.getReportsForProperty.mockResolvedValue([]);
    await controller.getReportsForProperty('prop-1');
    expect(adminService.getReportsForProperty).toHaveBeenCalledWith('prop-1');
  });

  it('removeReportedProperty should forward id, reason and adminUserId to service', async () => {
    adminService.removeReportedProperty.mockResolvedValue({
      message: 'تم حذف الإعلان بنجاح',
    });

    await controller.removeReportedProperty(ADMIN_REQ_USER, 'prop-1', {
      reason: 'مخالفة',
    });
    expect(adminService.removeReportedProperty).toHaveBeenCalledWith(
      'prop-1',
      'مخالفة',
      'admin-1',
    );
  });

  it('updateProperty should forward id, dto and adminUserId to service', async () => {
    adminService.updateProperty.mockResolvedValue({ id: 'prop-1' });

    const dto = { isHidden: true };
    await controller.updateProperty(ADMIN_REQ_USER, 'prop-1', dto);
    expect(adminService.updateProperty).toHaveBeenCalledWith(
      'prop-1',
      dto,
      'admin-1',
    );
  });

  it('getRequestsForUser should forward id to service', async () => {
    adminService.getRequestsForUser.mockResolvedValue([]);
    await controller.getRequestsForUser('u-1');
    expect(adminService.getRequestsForUser).toHaveBeenCalledWith('u-1');
  });

  it('getProjectsForUser should forward id to service', async () => {
    adminService.getProjectsForUser.mockResolvedValue([]);
    await controller.getProjectsForUser('u-1');
    expect(adminService.getProjectsForUser).toHaveBeenCalledWith('u-1');
  });

  it('deleteProject should forward id and adminUserId to service', async () => {
    adminService.deleteProject.mockResolvedValue({ message: 'تم الحذف' });
    await controller.deleteProject(ADMIN_REQ_USER, 'project-1');
    expect(adminService.deleteProject).toHaveBeenCalledWith(
      'project-1',
      'admin-1',
    );
  });

  it('getWallet should forward id to service', async () => {
    adminService.getWallet.mockResolvedValue({ freeAdsRemaining: 0 });
    await controller.getWallet('u-1');
    expect(adminService.getWallet).toHaveBeenCalledWith('u-1');
  });

  it('changePlan should forward id, dto and adminUserId to service', async () => {
    adminService.changePlan.mockResolvedValue({});
    const dto = { planId: 'plan-1' };
    await controller.changePlan(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.changePlan).toHaveBeenCalledWith('u-1', dto, 'admin-1');
  });

  it('grantExceptionalFeature should forward id, dto and adminUserId to service', async () => {
    adminService.grantExceptionalFeature.mockResolvedValue({ message: 'ok' });
    const dto = { adsCount: 3 };
    await controller.grantExceptionalFeature(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.grantExceptionalFeature).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
  });

  it('getInvoicesForUser should forward id to service', async () => {
    adminService.getInvoicesForUser.mockResolvedValue([]);
    await controller.getInvoicesForUser('u-1');
    expect(adminService.getInvoicesForUser).toHaveBeenCalledWith('u-1');
  });

  it('getCouponHistoryForUser should forward id to service', async () => {
    adminService.getCouponHistoryForUser.mockResolvedValue([]);
    await controller.getCouponHistoryForUser('u-1');
    expect(adminService.getCouponHistoryForUser).toHaveBeenCalledWith('u-1');
  });

  it('getReviewsForUser should forward id and query to service', async () => {
    adminService.getReviewsForUser.mockResolvedValue({ data: [] });
    const query = { page: '1' };
    await controller.getReviewsForUser('u-1', query);
    expect(adminService.getReviewsForUser).toHaveBeenCalledWith('u-1', query);
  });

  it('getReviewsSummaryForUser should forward id to service', async () => {
    adminService.getReviewsSummaryForUser.mockResolvedValue({
      averageRating: 0,
    });
    await controller.getReviewsSummaryForUser('u-1');
    expect(adminService.getReviewsSummaryForUser).toHaveBeenCalledWith('u-1');
  });

  it('deleteReview should forward id to service', async () => {
    adminService.deleteReview.mockResolvedValue({ message: 'تم الحذف' });
    await controller.deleteReview('review-1');
    expect(adminService.deleteReview).toHaveBeenCalledWith('review-1');
  });

  it('getNotesForUser should forward id to service', async () => {
    adminService.getNotesForUser.mockResolvedValue([]);
    await controller.getNotesForUser('u-1');
    expect(adminService.getNotesForUser).toHaveBeenCalledWith('u-1');
  });

  it('createNote should forward id, dto and adminUserId to service', async () => {
    adminService.createNote.mockResolvedValue({ id: 'note-1' });
    const dto = { content: 'نص' };
    await controller.createNote(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.createNote).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
  });

  it('updateNote should forward id and dto to service', async () => {
    adminService.updateNote.mockResolvedValue({ id: 'note-1' });
    const dto = { content: 'نص جديد' };
    await controller.updateNote('note-1', dto);
    expect(adminService.updateNote).toHaveBeenCalledWith('note-1', dto);
  });

  it('deleteNote should forward id to service', async () => {
    adminService.deleteNote.mockResolvedValue({ message: 'تم الحذف' });
    await controller.deleteNote('note-1');
    expect(adminService.deleteNote).toHaveBeenCalledWith('note-1');
  });

  it('getAssignableAdmins should delegate to service', async () => {
    adminService.getAssignableAdmins.mockResolvedValue([
      { id: 'admin-1', name: 'أحمد', email: null },
    ]);

    const result = await controller.getAssignableAdmins();
    expect(adminService.getAssignableAdmins).toHaveBeenCalledTimes(1);
    expect(result[0].id).toBe('admin-1');
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

    const result = await controller.notifyUsers(dto);
    expect(adminService.notifyUsers).toHaveBeenCalledWith(dto);
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

  it('getAvailableCoupons should delegate to service', () => {
    adminService.getAvailableCoupons.mockReturnValue([
      { id: 'c1', name: 'Byoutna10', code: 'LAUNCHPROMO26', discount: '10%' },
    ]);
    const result = controller.getAvailableCoupons();
    expect(adminService.getAvailableCoupons).toHaveBeenCalled();
    expect(result[0].code).toBe('LAUNCHPROMO26');
  });

  it('grantCoupon should forward params, dto and adminUserId to service', async () => {
    adminService.grantCoupon.mockResolvedValue({
      message: 'تم اضافة كوبون خصم للمستخدم “على البالي” بنجاح.',
    });
    const dto = { couponCode: 'LAUNCHPROMO26', couponName: 'Byoutna10' };
    const result = await controller.grantCoupon(ADMIN_REQ_USER, 'u-1', dto);
    expect(adminService.grantCoupon).toHaveBeenCalledWith(
      'u-1',
      dto,
      'admin-1',
    );
    expect(result.message).toContain('تم اضافة كوبون خصم للمستخدم');
  });

  it('grantBulkCoupon should forward dto and adminUserId to service', async () => {
    adminService.grantBulkCoupon.mockResolvedValue({
      message: 'تم اضافة كوبون خصم لـ 2 مستخدمين بنجاح.',
      grantedCount: 2,
    });
    const dto = {
      userIds: ['u-1', 'u-2'],
      couponCode: 'LAUNCHPROMO26',
      couponName: 'Byoutna10',
    };
    const result = await controller.grantBulkCoupon(ADMIN_REQ_USER, dto);
    expect(adminService.grantBulkCoupon).toHaveBeenCalledWith(dto, 'admin-1');
    expect(result.grantedCount).toBe(2);
  });
});
