import { Injectable } from '@nestjs/common';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import { AdminUpdateStatusDto } from './dto/admin-update-status.dto';
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
import { AdminUsersService } from './services/admin-users.service';
import { AdminIdentityService } from './services/admin-identity.service';
import { AdminExportService } from './services/admin-export.service';
import { AdminPasswordService } from './services/admin-password.service';
import { AdminCouponService } from './services/admin-coupon.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminVerificationsService } from './services/admin-verifications.service';
import { AdminReportsService } from './services/admin-reports.service';
import { AdminPropertiesService } from './services/admin-properties.service';
import { AdminUpdatePropertyDto } from './dto/admin-update-property.dto';
import { AdminRequestsService } from './services/admin-requests.service';
import { AdminExhibitionService } from './services/admin-exhibition.service';
import { AdminPlansService } from './services/admin-plans.service';
import { AdminInvoicesService } from './services/admin-invoices.service';
import { AdminChangePlanDto } from './dto/admin-change-plan.dto';
import { AdminGrantExceptionalFeatureDto } from './dto/admin-grant-exceptional-feature.dto';

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
    private readonly adminInvoicesService: AdminInvoicesService,
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

  async getRequestsForUser(userId: string) {
    return this.adminRequestsService.getRequestsForUser(userId);
  }

  async getProjectsForUser(userId: string) {
    return this.adminExhibitionService.getProjectsForUser(userId);
  }

  async deleteProject(projectId: string, adminUserId: string) {
    return this.adminExhibitionService.deleteProject(projectId, adminUserId);
  }

  async getWallet(userId: string) {
    return this.adminPlansService.getWallet(userId);
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
  ): Promise<AdminNotifyUsersResponseDto> {
    return this.adminUsersService.notifyUsers(dto);
  }

  async getUsers(filters: AdminUsersFilterDto) {
    return this.adminUsersService.getUsers(filters);
  }

  async getUserById(id: string) {
    return this.adminUsersService.getUserById(id);
  }

  async updateUserStatus(userId: string, dto: AdminUpdateStatusDto) {
    return this.adminUsersService.updateUserStatus(userId, dto);
  }

  async updateIdentityStatus(
    identityId: string,
    dto: AdminUpdateIdentityStatusDto,
  ) {
    return this.adminIdentityService.updateIdentityStatus(identityId, dto);
  }

  async requestIdentityEdit(
    identityId: string,
    dto: AdminRequestIdentityEditDto,
  ) {
    return this.adminIdentityService.requestIdentityEdit(identityId, dto);
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

  async getInvoicesForUser(userId: string) {
    return this.adminInvoicesService.getInvoicesForUser(userId);
  }

  async getCouponHistoryForUser(userId: string) {
    return this.adminInvoicesService.getCouponHistoryForUser(userId);
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
