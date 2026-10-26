import { Injectable } from '@nestjs/common';
import { AdminActionType } from '@prisma/client';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import {
  AdminUpdateStatusDto,
  UserAccountStatusAction,
} from './dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from './dto/admin-update-identity-status.dto';
import { AdminRequestIdentityEditDto } from './dto/admin-request-identity-edit.dto';
import { AdminCreateIndividualDto } from './dto/admin-create-individual.dto';
import {
  AdminNotifyUsersDto,
  AdminNotifyUsersResponseDto,
} from './dto/admin-notify-users.dto';
import { AdminVerificationsFilterDto } from './dto/admin-verifications-filter.dto';
import { AdminReportsFilterDto } from './dto/admin-reports-filter.dto';
import { AdminReportUpdateDto } from './dto/admin-report-update.dto';
import {
  AdminGrantCouponDto,
  AdminGrantBulkCouponDto,
} from './dto/admin-grant-coupon.dto';
import { AdminUsersService } from './services/users/admin-users.service';
import { AdminIdentityService } from './services/users/admin-identity.service';
import { AdminExportService } from './services/dashboard/admin-export.service';
import { AdminPasswordService } from './services/users/admin-password.service';
import { AdminCouponService } from './services/billing/admin-coupon.service';
import { AdminDashboardService } from './services/dashboard/admin-dashboard.service';
import { AdminVerificationsService } from './services/users/admin-verifications.service';
import { AdminReportsService } from './services/moderation/admin-reports.service';
import { AdminPropertiesService } from './services/moderation/admin-properties.service';
import { AdminUpdatePropertyDto } from './dto/admin-update-property.dto';
import { AdminRequestsService } from './services/user-profile/admin-requests.service';
import { AdminExhibitionService } from './services/user-profile/admin-exhibition.service';
import { AdminPlansService } from './services/billing/admin-plans.service';
import { AdminPlanCatalogService } from './services/billing/admin-plan-catalog.service';
import { AdminUpdatePlanDto } from './dto/admin-update-plan.dto';
import { AdminInvoicesService } from './services/billing/admin-invoices.service';
import { AdminBillingListService } from './services/billing/admin-billing-list.service';
import {
  AdminInvoicesFilterDto,
  AdminSubscriptionsFilterDto,
} from './dto/admin-billing-filter.dto';
import { AdminRatingsService } from './services/user-profile/admin-ratings.service';
import { GetReviewsDto } from '../reviews/dto/get-reviews.dto';
import { AdminNotesService } from './services/users/admin-notes.service';
import { AdminCreateNoteDto, AdminUpdateNoteDto } from './dto/admin-note.dto';
import { AdminChangePlanDto } from './dto/admin-change-plan.dto';
import { AdminGrantExceptionalFeatureDto } from './dto/admin-grant-exceptional-feature.dto';
import { AdminAuditLogService } from './services/audit/admin-audit-log.service';
import { AdminFeaturePackagesService } from './services/billing/admin-feature-packages.service';
import {
  AdminCreateFeaturePackageDto,
  AdminUpdateFeaturePackageDto,
} from './dto/admin-feature-package.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly adminIdentityService: AdminIdentityService,
    private readonly adminExportService: AdminExportService,
    private readonly adminPasswordService: AdminPasswordService,
    private readonly adminCouponService: AdminCouponService,
    private readonly adminDashboardService: AdminDashboardService,
    private readonly adminVerificationsService: AdminVerificationsService,
    private readonly adminReportsService: AdminReportsService,
    private readonly adminPropertiesService: AdminPropertiesService,
    private readonly adminRequestsService: AdminRequestsService,
    private readonly adminExhibitionService: AdminExhibitionService,
    private readonly adminPlansService: AdminPlansService,
    private readonly adminPlanCatalogService: AdminPlanCatalogService,
    private readonly adminInvoicesService: AdminInvoicesService,
    private readonly adminBillingListService: AdminBillingListService,
    private readonly adminRatingsService: AdminRatingsService,
    private readonly adminNotesService: AdminNotesService,
    private readonly adminAuditLogService: AdminAuditLogService,
    private readonly adminFeaturePackagesService: AdminFeaturePackagesService,
  ) {}

  async getDashboard() {
    const [dashboard, reportStats] = await Promise.all([
      this.adminDashboardService.getDashboard(),
      this.adminReportsService.getDashboardReportStats(),
    ]);
    return {
      ...dashboard,
      metrics: {
        ...dashboard.metrics,
        newReportsCount: reportStats.newReportsCount,
      },
    };
  }

  async getReports(filters: AdminReportsFilterDto) {
    return this.adminReportsService.getReports(filters);
  }

  async getReportById(id: string) {
    return this.adminReportsService.getReportById(id);
  }

  async updateReport(
    id: string,
    dto: AdminReportUpdateDto,
    adminUserId: string,
  ) {
    return this.adminReportsService.updateReport(id, dto, adminUserId);
  }

  /**
   * «حذف المحتوى وإيقاف الحساب» (Guideline 1.2: act on a report within 24
   * hours): removes the reported listing, review or story, suspends the
   * account that posted it, and resolves the report (which tells the
   * reporter). Each step is the same as doing it by hand.
   */
  async enforceReport(id: string, adminUserId: string) {
    const { targetUserId } =
      await this.adminReportsService.removeReportedContent(id, adminUserId);
    if (targetUserId) {
      await this.adminUsersService.updateUserStatus(
        targetUserId,
        { status: UserAccountStatusAction.SUSPENDED },
        adminUserId,
      );
    }
    return this.adminReportsService.updateReport(
      id,
      { status: 'RESOLVED' },
      adminUserId,
    );
  }

  async resolveReports(ids: string[], adminUserId: string) {
    return this.adminReportsService.resolveReports(ids, adminUserId);
  }

  async dismissReports(ids: string[], adminUserId: string) {
    return this.adminReportsService.dismissReports(ids, adminUserId);
  }

  async getReportsForUser(userId: string, filters: AdminReportsFilterDto) {
    return this.adminReportsService.getReportsForUser(userId, filters);
  }

  async getReportsForProperty(propertyId: string) {
    return this.adminReportsService.getReportsForProperty(propertyId);
  }

  async removeReportedProperty(
    propertyId: string,
    reason?: string,
    adminUserId?: string,
  ) {
    return this.adminReportsService.removeReportedProperty(
      propertyId,
      reason,
      adminUserId,
    );
  }

  async updateProperty(
    propertyId: string,
    dto: AdminUpdatePropertyDto,
    adminUserId: string,
  ) {
    return this.adminPropertiesService.updateProperty(
      propertyId,
      dto,
      adminUserId,
    );
  }

  async getRequestsForUser(userId: string, identityId?: string) {
    return this.adminRequestsService.getRequestsForUser(userId, identityId);
  }

  async getProjectsForUser(userId: string, identityId?: string) {
    return this.adminExhibitionService.getProjectsForUser(userId, identityId);
  }

  async getServicesForUser(userId: string, identityId?: string) {
    return this.adminExhibitionService.getServicesForUser(userId, identityId);
  }

  async deleteProject(projectId: string, adminUserId: string) {
    return this.adminExhibitionService.deleteProject(projectId, adminUserId);
  }

  async getWallet(userId: string, identityId?: string) {
    return this.adminPlansService.getWallet(userId, identityId);
  }

  async changePlan(
    userId: string,
    dto: AdminChangePlanDto,
    adminUserId: string,
  ) {
    return this.adminPlansService.changePlan(userId, dto, adminUserId);
  }

  async grantExceptionalFeature(
    userId: string,
    dto: AdminGrantExceptionalFeatureDto,
    adminUserId: string,
  ) {
    return this.adminPlansService.grantExceptionalFeature(
      userId,
      dto,
      adminUserId,
    );
  }

  async getAssignableAdmins() {
    return this.adminReportsService.getAssignableAdmins();
  }

  async getVerifications(filters: AdminVerificationsFilterDto) {
    return this.adminVerificationsService.getVerifications(filters);
  }

  async notifyUsers(
    dto: AdminNotifyUsersDto,
    adminUserId?: string,
  ): Promise<AdminNotifyUsersResponseDto> {
    return this.adminUsersService.notifyUsers(dto, adminUserId);
  }

  async getUsers(filters: AdminUsersFilterDto) {
    return this.adminUsersService.getUsers(filters);
  }

  async getUserById(id: string) {
    return this.adminUsersService.getUserById(id);
  }

  async updateUserStatus(
    userId: string,
    dto: AdminUpdateStatusDto,
    adminUserId?: string,
  ) {
    return this.adminUsersService.updateUserStatus(userId, dto, adminUserId);
  }

  async updateIdentityStatus(
    identityId: string,
    dto: AdminUpdateIdentityStatusDto,
    adminUserId?: string,
  ) {
    return this.adminIdentityService.updateIdentityStatus(
      identityId,
      dto,
      adminUserId,
    );
  }

  async requestIdentityEdit(
    identityId: string,
    dto: AdminRequestIdentityEditDto,
    adminUserId?: string,
  ) {
    return this.adminIdentityService.requestIdentityEdit(
      identityId,
      dto,
      adminUserId,
    );
  }

  async deleteUser(userId: string) {
    return this.adminUsersService.deleteUser(userId);
  }

  async createIndividual(dto: AdminCreateIndividualDto) {
    return this.adminUsersService.createIndividual(dto);
  }

  async exportUsersCsv(filters: AdminUsersFilterDto): Promise<string> {
    return this.adminExportService.exportUsersCsv(filters, (f) =>
      this.getUsers(f),
    );
  }

  async sendUserPasswordResetLink(userId: string) {
    return this.adminPasswordService.sendUserPasswordResetLink(userId);
  }

  getAvailableCoupons() {
    return this.adminCouponService.getAvailableCoupons();
  }

  // --- PLANS THE APP SELLS ---
  getPlanCatalog() {
    return this.adminPlanCatalogService.list();
  }

  updatePlan(id: string, dto: AdminUpdatePlanDto, adminUserId: string) {
    return this.adminPlanCatalogService.update(id, dto, adminUserId);
  }

  // --- FEATURE AD PRICE LIST ---
  getFeaturePackages() {
    return this.adminFeaturePackagesService.list();
  }

  createFeaturePackage(dto: AdminCreateFeaturePackageDto, adminUserId: string) {
    return this.adminFeaturePackagesService.create(dto, adminUserId);
  }

  updateFeaturePackage(
    id: string,
    dto: AdminUpdateFeaturePackageDto,
    adminUserId: string,
  ) {
    return this.adminFeaturePackagesService.update(id, dto, adminUserId);
  }

  async getSubscriptions(filters: AdminSubscriptionsFilterDto) {
    return this.adminBillingListService.getSubscriptions(filters);
  }

  async getInvoices(filters: AdminInvoicesFilterDto) {
    return this.adminBillingListService.getInvoices(filters);
  }

  async getInvoicesForUser(userId: string, identityId?: string) {
    return this.adminInvoicesService.getInvoicesForUser(userId, identityId);
  }

  async getCouponHistoryForUser(userId: string) {
    return this.adminInvoicesService.getCouponHistoryForUser(userId);
  }

  async getReviewsForUser(
    userId: string,
    query?: GetReviewsDto,
    identityId?: string,
  ) {
    return this.adminRatingsService.getReviewsForUser(
      userId,
      query,
      identityId,
    );
  }

  async getReviewsSummaryForUser(userId: string, identityId?: string) {
    return this.adminRatingsService.getSummaryForUser(userId, identityId);
  }

  async deleteReview(reviewId: string) {
    return this.adminRatingsService.deleteReview(reviewId);
  }

  async getNotesForUser(userId: string) {
    return this.adminNotesService.getNotesForUser(userId);
  }

  async createNote(
    userId: string,
    dto: AdminCreateNoteDto,
    authorAdminId: string,
  ) {
    return this.adminNotesService.createNote(userId, dto, authorAdminId);
  }

  async updateNote(noteId: string, dto: AdminUpdateNoteDto) {
    return this.adminNotesService.updateNote(noteId, dto);
  }

  async deleteNote(noteId: string) {
    return this.adminNotesService.deleteNote(noteId);
  }

  async getLogsForUser(userId: string, page?: number, limit?: number) {
    return this.adminAuditLogService.getLogsForUser(userId, page, limit);
  }

  async getLogs(page?: number, limit?: number, action?: AdminActionType) {
    return this.adminAuditLogService.getLogs(page, limit, action);
  }

  async grantCoupon(
    userId: string,
    dto: AdminGrantCouponDto,
    adminUserId?: string,
  ) {
    return this.adminCouponService.grantCoupon(userId, dto, adminUserId);
  }

  async grantBulkCoupon(dto: AdminGrantBulkCouponDto, adminUserId?: string) {
    return this.adminCouponService.grantBulkCoupon(dto, adminUserId);
  }
}
