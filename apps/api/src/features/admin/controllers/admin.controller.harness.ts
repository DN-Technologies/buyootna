/**
 * Shared setup for the admin controller specs: every admin controller
 * against one mocked AdminService, rebuilt before each test. The
 * controllers only forward to the service, so the specs check what they
 * pass on.
 */
import { Test, TestingModule } from '@nestjs/testing';
import type { Type } from '@nestjs/common';

import { AdminService } from '../admin.service';
import { ADMIN_CONTROLLERS } from './index';

const MOCKED = [
  'getUsers',
  'getUserById',
  'createIndividual',
  'exportUsersCsv',
  'updateUserStatus',
  'deleteUser',
  'updateIdentityStatus',
  'sendUserPasswordResetLink',
  'getAvailableCoupons',
  'grantCoupon',
  'grantBulkCoupon',
  'getVerifications',
  'notifyUsers',
  'getReports',
  'getReportById',
  'updateReport',
  'resolveReports',
  'dismissReports',
  'getReportsForUser',
  'getReportsForProperty',
  'removeReportedProperty',
  'updateProperty',
  'getRequestsForUser',
  'getProjectsForUser',
  'deleteProject',
  'getWallet',
  'changePlan',
  'grantExceptionalFeature',
  'getInvoicesForUser',
  'getCouponHistoryForUser',
  'getReviewsForUser',
  'getReviewsSummaryForUser',
  'deleteReview',
  'getNotesForUser',
  'createNote',
  'updateNote',
  'deleteNote',
  'getLogsForUser',
  'getAssignableAdmins',
  'enforceReport',
] as const;

export type MockAdminService = Record<(typeof MOCKED)[number], jest.Mock>;

/**
 * Call inside a describe: registers the beforeEach that builds the module;
 * read `adminService` and `get(SomeController)` in a beforeEach of your own.
 */
export function setupAdminControllers() {
  let module: TestingModule;
  const harness = {
    adminService: {} as MockAdminService,
    get: <T>(controller: Type<T>): T => module.get(controller),
  };

  beforeEach(async () => {
    harness.adminService = Object.fromEntries(
      MOCKED.map((name) => [name, jest.fn()]),
    ) as MockAdminService;
    module = await Test.createTestingModule({
      controllers: ADMIN_CONTROLLERS,
      providers: [{ provide: AdminService, useValue: harness.adminService }],
    }).compile();
  });

  return harness;
}
