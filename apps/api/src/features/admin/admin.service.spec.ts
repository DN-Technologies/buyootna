import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminIdentityService } from './services/admin-identity.service';
import { AdminExportService } from './services/admin-export.service';
import { AdminPasswordService } from './services/admin-password.service';
import { AdminCouponService } from './services/admin-coupon.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminVerificationsService } from './services/admin-verifications.service';
import { AdminReportsService } from './services/admin-reports.service';
import { AdminPropertiesService } from './services/admin-properties.service';
import { AdminRequestsService } from './services/admin-requests.service';
import { AdminExhibitionService } from './services/admin-exhibition.service';
import { AdminPlansService } from './services/admin-plans.service';
import { AdminInvoicesService } from './services/admin-invoices.service';
import { Role } from '@prisma/client';
import { UserAccountStatusAction } from './dto/admin-update-status.dto';

interface MockAdminUsersService {
  getUsers: jest.Mock;
  getUserById: jest.Mock;
  updateUserStatus: jest.Mock;
  deleteUser: jest.Mock;
  createIndividual: jest.Mock;
  notifyUsers: jest.Mock;
}

interface MockAdminIdentityService {
  updateIdentityStatus: jest.Mock;
  requestIdentityEdit: jest.Mock;
}

interface MockAdminExportService {
  exportUsersCsv: jest.Mock;
}

interface MockAdminPasswordService {
  sendUserPasswordResetLink: jest.Mock;
}

interface MockAdminCouponService {
  getAvailableCoupons: jest.Mock;
  grantCoupon: jest.Mock;
  grantBulkCoupon: jest.Mock;
}

interface MockAdminDashboardService {
  getDashboard: jest.Mock;
}

interface MockAdminVerificationsService {
  getVerifications: jest.Mock;
}

interface MockAdminReportsService {
  getReports: jest.Mock;
  getReportById: jest.Mock;
  updateReport: jest.Mock;
  resolveReports: jest.Mock;
  dismissReports: jest.Mock;
  getReportsForUser: jest.Mock;
  getReportsForProperty: jest.Mock;
  removeReportedProperty: jest.Mock;
  getAssignableAdmins: jest.Mock;
  getDashboardReportStats: jest.Mock;
}

interface MockAdminPropertiesService {
  updateProperty: jest.Mock;
}

interface MockAdminRequestsService {
  getRequestsForUser: jest.Mock;
}

interface MockAdminExhibitionService {
  getProjectsForUser: jest.Mock;
  deleteProject: jest.Mock;
}

interface MockAdminPlansService {
  getWallet: jest.Mock;
  changePlan: jest.Mock;
  grantExceptionalFeature: jest.Mock;
}

interface MockAdminInvoicesService {
  getInvoicesForUser: jest.Mock;
  getCouponHistoryForUser: jest.Mock;
}

describe('AdminService', () => {
  let service: AdminService;
  let adminUsersService: MockAdminUsersService;
  let adminIdentityService: MockAdminIdentityService;
  let adminExportService: MockAdminExportService;
  let adminPasswordService: MockAdminPasswordService;
  let adminCouponService: MockAdminCouponService;
  let adminDashboardService: MockAdminDashboardService;
  let adminVerificationsService: MockAdminVerificationsService;
  let adminReportsService: MockAdminReportsService;
  let adminPropertiesService: MockAdminPropertiesService;
  let adminRequestsService: MockAdminRequestsService;
  let adminExhibitionService: MockAdminExhibitionService;
  let adminPlansService: MockAdminPlansService;
  let adminInvoicesService: MockAdminInvoicesService;

  beforeEach(async () => {
    adminUsersService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUserStatus: jest.fn(),
      deleteUser: jest.fn(),
      createIndividual: jest.fn(),
      notifyUsers: jest.fn(),
    };

    adminIdentityService = {
      updateIdentityStatus: jest.fn(),
      requestIdentityEdit: jest.fn(),
    };

    adminExportService = {
      exportUsersCsv: jest.fn(),
    };

    adminPasswordService = {
      sendUserPasswordResetLink: jest.fn(),
    };

    adminCouponService = {
      getAvailableCoupons: jest.fn(),
      grantCoupon: jest.fn(),
      grantBulkCoupon: jest.fn(),
    };

    adminDashboardService = {
      getDashboard: jest.fn(),
    };

    adminVerificationsService = {
      getVerifications: jest.fn(),
    };

    adminReportsService = {
      getReports: jest.fn(),
      getReportById: jest.fn(),
      updateReport: jest.fn(),
      resolveReports: jest.fn(),
      dismissReports: jest.fn(),
      getReportsForUser: jest.fn(),
      getReportsForProperty: jest.fn(),
      removeReportedProperty: jest.fn(),
      getAssignableAdmins: jest.fn(),
      getDashboardReportStats: jest.fn().mockResolvedValue({
        newReportsCount: 0,
      }),
    };

    adminPropertiesService = {
      updateProperty: jest.fn(),
    };

    adminRequestsService = {
      getRequestsForUser: jest.fn(),
    };

    adminExhibitionService = {
      getProjectsForUser: jest.fn(),
      deleteProject: jest.fn(),
    };

    adminPlansService = {
      getWallet: jest.fn(),
      changePlan: jest.fn(),
      grantExceptionalFeature: jest.fn(),
    };

    adminInvoicesService = {
      getInvoicesForUser: jest.fn(),
      getCouponHistoryForUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminUsersService,
          useValue: adminUsersService,
        },
        {
          provide: AdminIdentityService,
          useValue: adminIdentityService,
        },
        {
          provide: AdminExportService,
          useValue: adminExportService,
        },
        {
          provide: AdminPasswordService,
          useValue: adminPasswordService,
        },
        {
          provide: AdminCouponService,
          useValue: adminCouponService,
        },
        {
          provide: AdminDashboardService,
          useValue: adminDashboardService,
        },
        {
          provide: AdminVerificationsService,
          useValue: adminVerificationsService,
        },
        {
          provide: AdminReportsService,
          useValue: adminReportsService,
        },
        {
          provide: AdminPropertiesService,
          useValue: adminPropertiesService,
        },
        {
          provide: AdminRequestsService,
          useValue: adminRequestsService,
        },
        {
          provide: AdminExhibitionService,
          useValue: adminExhibitionService,
        },
        {
          provide: AdminPlansService,
          useValue: adminPlansService,
        },
        {
          provide: AdminInvoicesService,
          useValue: adminInvoicesService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('facade delegation', () => {
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

    it('delegates getReports to AdminReportsService', async () => {
      const filters = { page: 1, limit: 10 };
      const mockResult = { data: [] };
      adminReportsService.getReports.mockResolvedValue(mockResult);

      const result = await service.getReports(filters as any);

      expect(adminReportsService.getReports).toHaveBeenCalledWith(filters);
      expect(result).toBe(mockResult);
    });

    it('delegates getReportById to AdminReportsService', async () => {
      const mockResult = { id: 'rep-1' };
      adminReportsService.getReportById.mockResolvedValue(mockResult);

      const result = await service.getReportById('rep-1');

      expect(adminReportsService.getReportById).toHaveBeenCalledWith('rep-1');
      expect(result).toBe(mockResult);
    });

    it('delegates updateReport to AdminReportsService', async () => {
      const dto = { status: 'RESOLVED' as const };
      const mockResult = { id: 'rep-1', status: 'RESOLVED' };
      adminReportsService.updateReport.mockResolvedValue(mockResult);

      const result = await service.updateReport('rep-1', dto, 'admin-1');

      expect(adminReportsService.updateReport).toHaveBeenCalledWith(
        'rep-1',
        dto,
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates resolveReports to AdminReportsService', async () => {
      const mockResult = { updatedCount: 2 };
      adminReportsService.resolveReports.mockResolvedValue(mockResult);

      const result = await service.resolveReports(
        ['rep-1', 'rep-2'],
        'admin-1',
      );

      expect(adminReportsService.resolveReports).toHaveBeenCalledWith(
        ['rep-1', 'rep-2'],
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates dismissReports to AdminReportsService', async () => {
      const mockResult = { updatedCount: 1 };
      adminReportsService.dismissReports.mockResolvedValue(mockResult);

      const result = await service.dismissReports(['rep-1'], 'admin-1');

      expect(adminReportsService.dismissReports).toHaveBeenCalledWith(
        ['rep-1'],
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getReportsForUser to AdminReportsService', async () => {
      const filters = { page: 1, limit: 10 };
      const mockResult = { data: [] };
      adminReportsService.getReportsForUser.mockResolvedValue(mockResult);

      const result = await service.getReportsForUser('u-1', filters as any);

      expect(adminReportsService.getReportsForUser).toHaveBeenCalledWith(
        'u-1',
        filters,
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getReportsForProperty to AdminReportsService', async () => {
      const mockResult: any[] = [];
      adminReportsService.getReportsForProperty.mockResolvedValue(mockResult);

      const result = await service.getReportsForProperty('prop-1');

      expect(adminReportsService.getReportsForProperty).toHaveBeenCalledWith(
        'prop-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates removeReportedProperty to AdminReportsService', async () => {
      const mockResult = { message: 'تم حذف الإعلان بنجاح' };
      adminReportsService.removeReportedProperty.mockResolvedValue(
        mockResult,
      );

      const result = await service.removeReportedProperty(
        'prop-1',
        'مخالفة',
        'admin-1',
      );

      expect(adminReportsService.removeReportedProperty).toHaveBeenCalledWith(
        'prop-1',
        'مخالفة',
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates updateProperty to AdminPropertiesService', async () => {
      const dto = { isHidden: true };
      const mockResult = { id: 'prop-1', isHidden: true };
      adminPropertiesService.updateProperty.mockResolvedValue(mockResult);

      const result = await service.updateProperty('prop-1', dto, 'admin-1');

      expect(adminPropertiesService.updateProperty).toHaveBeenCalledWith(
        'prop-1',
        dto,
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getRequestsForUser to AdminRequestsService', async () => {
      const mockResult: any[] = [];
      adminRequestsService.getRequestsForUser.mockResolvedValue(mockResult);

      const result = await service.getRequestsForUser('u-1');

      expect(adminRequestsService.getRequestsForUser).toHaveBeenCalledWith(
        'u-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getProjectsForUser to AdminExhibitionService', async () => {
      const mockResult: any[] = [];
      adminExhibitionService.getProjectsForUser.mockResolvedValue(mockResult);

      const result = await service.getProjectsForUser('u-1');

      expect(adminExhibitionService.getProjectsForUser).toHaveBeenCalledWith(
        'u-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates deleteProject to AdminExhibitionService', async () => {
      const mockResult = { message: 'تم الحذف' };
      adminExhibitionService.deleteProject.mockResolvedValue(mockResult);

      const result = await service.deleteProject('project-1', 'admin-1');

      expect(adminExhibitionService.deleteProject).toHaveBeenCalledWith(
        'project-1',
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getWallet to AdminPlansService', async () => {
      const mockResult = { freeAdsRemaining: 0 };
      adminPlansService.getWallet.mockResolvedValue(mockResult);

      const result = await service.getWallet('u-1');

      expect(adminPlansService.getWallet).toHaveBeenCalledWith('u-1');
      expect(result).toBe(mockResult);
    });

    it('delegates changePlan to AdminPlansService', async () => {
      const dto = { planId: 'plan-1' };
      const mockResult = { freeAdsRemaining: 0 };
      adminPlansService.changePlan.mockResolvedValue(mockResult);

      const result = await service.changePlan('u-1', dto, 'admin-1');

      expect(adminPlansService.changePlan).toHaveBeenCalledWith(
        'u-1',
        dto,
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates grantExceptionalFeature to AdminPlansService', async () => {
      const dto = { adsCount: 3 };
      const mockResult = { message: 'تم منح المميزات الاستثنائية بنجاح' };
      adminPlansService.grantExceptionalFeature.mockResolvedValue(mockResult);

      const result = await service.grantExceptionalFeature(
        'u-1',
        dto,
        'admin-1',
      );

      expect(adminPlansService.grantExceptionalFeature).toHaveBeenCalledWith(
        'u-1',
        dto,
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getInvoicesForUser to AdminInvoicesService', async () => {
      const mockResult: any[] = [];
      adminInvoicesService.getInvoicesForUser.mockResolvedValue(mockResult);

      const result = await service.getInvoicesForUser('u-1');

      expect(adminInvoicesService.getInvoicesForUser).toHaveBeenCalledWith(
        'u-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates getCouponHistoryForUser to AdminInvoicesService', async () => {
      const mockResult: any[] = [];
      adminInvoicesService.getCouponHistoryForUser.mockResolvedValue(
        mockResult,
      );

      const result = await service.getCouponHistoryForUser('u-1');

      expect(
        adminInvoicesService.getCouponHistoryForUser,
      ).toHaveBeenCalledWith('u-1');
      expect(result).toBe(mockResult);
    });

    it('delegates getAssignableAdmins to AdminReportsService', async () => {
      const mockResult = [{ id: 'admin-1', name: 'أحمد', email: null }];
      adminReportsService.getAssignableAdmins.mockResolvedValue(mockResult);

      const result = await service.getAssignableAdmins();

      expect(adminReportsService.getAssignableAdmins).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResult);
    });

    it('delegates getVerifications to AdminVerificationsService', async () => {
      const filters = { page: 1, limit: 10 };
      const mockResult = { data: [] };
      adminVerificationsService.getVerifications.mockResolvedValue(mockResult);

      const result = await service.getVerifications(filters as any);

      expect(adminVerificationsService.getVerifications).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toBe(mockResult);
    });

    it('delegates notifyUsers to AdminUsersService', async () => {
      const dto = { userIds: ['u-1'], title: 'مرحبا', message: 'نص' };
      const mockResult = { notifiedCount: 1 };
      adminUsersService.notifyUsers.mockResolvedValue(mockResult);

      const result = await service.notifyUsers(dto);

      expect(adminUsersService.notifyUsers).toHaveBeenCalledWith(dto);
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

      const result = await service.updateUserStatus('u-1', dto);

      expect(adminUsersService.updateUserStatus).toHaveBeenCalledWith(
        'u-1',
        dto,
      );
      expect(result).toBe(mockResult);
    });

    it('delegates updateIdentityStatus to AdminIdentityService', async () => {
      const dto = { status: 'APPROVED' } as any;
      const mockResult = { id: 'ident-1', status: 'APPROVED' };
      adminIdentityService.updateIdentityStatus.mockResolvedValue(mockResult);

      const result = await service.updateIdentityStatus('ident-1', dto);

      expect(adminIdentityService.updateIdentityStatus).toHaveBeenCalledWith(
        'ident-1',
        dto,
      );
      expect(result).toBe(mockResult);
    });

    it('delegates requestIdentityEdit to AdminIdentityService', async () => {
      const dto = { notes: 'يرجى رفع رخصة أوضح' };
      const mockResult = { id: 'req-1' };
      adminIdentityService.requestIdentityEdit.mockResolvedValue(mockResult);

      const result = await service.requestIdentityEdit('ident-1', dto);

      expect(adminIdentityService.requestIdentityEdit).toHaveBeenCalledWith(
        'ident-1',
        dto,
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

      expect(
        adminPasswordService.sendUserPasswordResetLink,
      ).toHaveBeenCalledWith('u-1');
      expect(result).toBe(mockResult);
    });

    it('delegates getAvailableCoupons to AdminCouponService', () => {
      const mockCoupons = [{ id: 'c1', name: 'Coupon 1' }];
      adminCouponService.getAvailableCoupons.mockReturnValue(mockCoupons);

      const result = service.getAvailableCoupons();

      expect(adminCouponService.getAvailableCoupons).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockCoupons);
    });

    it('delegates grantCoupon to AdminCouponService', async () => {
      const dto = { couponCode: 'PROMO10' };
      const mockResult = { message: 'تم المنح' };
      adminCouponService.grantCoupon.mockResolvedValue(mockResult);

      const result = await service.grantCoupon('u-1', dto, 'admin-1');

      expect(adminCouponService.grantCoupon).toHaveBeenCalledWith(
        'u-1',
        dto,
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });

    it('delegates grantBulkCoupon to AdminCouponService', async () => {
      const dto = { userIds: ['u1', 'u2'], couponCode: 'PROMO10' };
      const mockResult = { grantedCount: 2 };
      adminCouponService.grantBulkCoupon.mockResolvedValue(mockResult);

      const result = await service.grantBulkCoupon(dto, 'admin-1');

      expect(adminCouponService.grantBulkCoupon).toHaveBeenCalledWith(
        dto,
        'admin-1',
      );
      expect(result).toBe(mockResult);
    });
  });
});
