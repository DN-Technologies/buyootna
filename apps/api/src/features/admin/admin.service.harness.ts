/**
 * Shared setup for the AdminService facade specs (users, moderation, user
 * profile, billing): every sub-service mocked, the mocks reset before each
 * test, and a fresh AdminService. The mock objects stay the same across
 * tests, so a spec can destructure them once.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/users/admin-users.service';
import { AdminIdentityService } from './services/users/admin-identity.service';
import { AdminExportService } from './services/dashboard/admin-export.service';
import { AdminPasswordService } from './services/users/admin-password.service';
import { AdminCouponService } from './services/billing/admin-coupon.service';
import { AdminDashboardService } from './services/dashboard/admin-dashboard.service';
import { AdminVerificationsService } from './services/users/admin-verifications.service';
import { AdminReportsService } from './services/moderation/admin-reports.service';
import { AdminPropertiesService } from './services/moderation/admin-properties.service';
import { AdminRequestsService } from './services/user-profile/admin-requests.service';
import { AdminExhibitionService } from './services/user-profile/admin-exhibition.service';
import { AdminPlansService } from './services/billing/admin-plans.service';
import { AdminInvoicesService } from './services/billing/admin-invoices.service';
import { AdminBillingListService } from './services/billing/admin-billing-list.service';
import { AdminRatingsService } from './services/user-profile/admin-ratings.service';
import { AdminNotesService } from './services/users/admin-notes.service';
import { AdminAuditLogService } from './services/audit/admin-audit-log.service';
import { AdminFeaturePackagesService } from './services/billing/admin-feature-packages.service';
import { AdminPlanCatalogService } from './services/billing/admin-plan-catalog.service';

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
  removeReportedContent: jest.Mock;
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
  getServicesForUser: jest.Mock;
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

interface MockAdminRatingsService {
  getReviewsForUser: jest.Mock;
  getSummaryForUser: jest.Mock;
  deleteReview: jest.Mock;
}

interface MockAdminNotesService {
  getNotesForUser: jest.Mock;
  createNote: jest.Mock;
  updateNote: jest.Mock;
  deleteNote: jest.Mock;
}

interface MockAdminAuditLogService {
  getLogsForUser: jest.Mock;
  getLogs: jest.Mock;
}

export interface AdminServiceMocks {
  adminUsersService: MockAdminUsersService;
  adminIdentityService: MockAdminIdentityService;
  adminExportService: MockAdminExportService;
  adminPasswordService: MockAdminPasswordService;
  adminCouponService: MockAdminCouponService;
  adminDashboardService: MockAdminDashboardService;
  adminVerificationsService: MockAdminVerificationsService;
  adminReportsService: MockAdminReportsService;
  adminPropertiesService: MockAdminPropertiesService;
  adminRequestsService: MockAdminRequestsService;
  adminExhibitionService: MockAdminExhibitionService;
  adminPlansService: MockAdminPlansService;
  adminInvoicesService: MockAdminInvoicesService;
  adminRatingsService: MockAdminRatingsService;
  adminNotesService: MockAdminNotesService;
  adminAuditLogService: MockAdminAuditLogService;
  adminBillingListService: {
    getSubscriptions: jest.Mock;
    getInvoices: jest.Mock;
  };
  adminPlanCatalogService: { list: jest.Mock; update: jest.Mock };
  adminFeaturePackagesService: {
    list: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
}

function createMocks(): AdminServiceMocks {
  return {
    adminUsersService: {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUserStatus: jest.fn(),
      deleteUser: jest.fn(),
      createIndividual: jest.fn(),
      notifyUsers: jest.fn(),
    },

    adminIdentityService: {
      updateIdentityStatus: jest.fn(),
      requestIdentityEdit: jest.fn(),
    },

    adminExportService: {
      exportUsersCsv: jest.fn(),
    },

    adminPasswordService: {
      sendUserPasswordResetLink: jest.fn(),
    },

    adminCouponService: {
      getAvailableCoupons: jest.fn(),
      grantCoupon: jest.fn(),
      grantBulkCoupon: jest.fn(),
    },

    adminDashboardService: {
      getDashboard: jest.fn(),
    },

    adminVerificationsService: {
      getVerifications: jest.fn(),
    },

    adminReportsService: {
      getReports: jest.fn(),
      getReportById: jest.fn(),
      updateReport: jest.fn(),
      resolveReports: jest.fn(),
      dismissReports: jest.fn(),
      getReportsForUser: jest.fn(),
      getReportsForProperty: jest.fn(),
      removeReportedProperty: jest.fn(),
      removeReportedContent: jest.fn(),
      getAssignableAdmins: jest.fn(),
      getDashboardReportStats: jest.fn().mockResolvedValue({
        newReportsCount: 0,
      }),
    },

    adminPropertiesService: {
      updateProperty: jest.fn(),
    },

    adminRequestsService: {
      getRequestsForUser: jest.fn(),
    },

    adminExhibitionService: {
      getServicesForUser: jest.fn(),
      getProjectsForUser: jest.fn(),
      deleteProject: jest.fn(),
    },

    adminPlansService: {
      getWallet: jest.fn(),
      changePlan: jest.fn(),
      grantExceptionalFeature: jest.fn(),
    },

    adminInvoicesService: {
      getInvoicesForUser: jest.fn(),
      getCouponHistoryForUser: jest.fn(),
    },

    adminRatingsService: {
      getReviewsForUser: jest.fn(),
      getSummaryForUser: jest.fn(),
      deleteReview: jest.fn(),
    },

    adminNotesService: {
      getNotesForUser: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    },

    adminAuditLogService: {
      getLogsForUser: jest.fn(),
      getLogs: jest.fn(),
    },
    adminBillingListService: {
      getSubscriptions: jest.fn(),
      getInvoices: jest.fn(),
    },
    adminPlanCatalogService: { list: jest.fn(), update: jest.fn() },
    adminFeaturePackagesService: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

/**
 * Call inside a describe: registers the beforeEach that resets every mock
 * and builds AdminService; read `service` from the result in tests.
 */
export function setupAdminService() {
  const mocks = createMocks();
  const harness = {
    ...mocks,
    service: undefined as unknown as AdminService,
  };

  beforeEach(async () => {
    for (const mock of Object.values(mocks)) {
      for (const fn of Object.values(mock as Record<string, jest.Mock>)) {
        fn.mockReset();
      }
    }
    // The dashboard merges these in; most tests don't care
    mocks.adminReportsService.getDashboardReportStats.mockResolvedValue({
      newReportsCount: 0,
    });

    const {
      adminUsersService,
      adminIdentityService,
      adminExportService,
      adminPasswordService,
      adminCouponService,
      adminDashboardService,
      adminVerificationsService,
      adminReportsService,
      adminPropertiesService,
      adminRequestsService,
      adminExhibitionService,
      adminPlansService,
      adminInvoicesService,
      adminRatingsService,
      adminNotesService,
      adminAuditLogService,
      adminBillingListService,
      adminFeaturePackagesService,
      adminPlanCatalogService,
    } = mocks;
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
        {
          provide: AdminRatingsService,
          useValue: adminRatingsService,
        },
        {
          provide: AdminNotesService,
          useValue: adminNotesService,
        },
        {
          provide: AdminAuditLogService,
          useValue: adminAuditLogService,
        },
        {
          provide: AdminBillingListService,
          useValue: adminBillingListService,
        },
        {
          provide: AdminFeaturePackagesService,
          useValue: adminFeaturePackagesService,
        },
        {
          provide: AdminPlanCatalogService,
          useValue: adminPlanCatalogService,
        },
      ],
    }).compile();

    harness.service = module.get<AdminService>(AdminService);
  });

  return harness;
}
