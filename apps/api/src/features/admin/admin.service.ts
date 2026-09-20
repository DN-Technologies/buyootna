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
  ) {}

  async getDashboard() {
    return this.adminDashboardService.getDashboard();
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

  async grantCoupon(userId: string, dto: AdminGrantCouponDto) {
    return this.adminCouponService.grantCoupon(userId, dto);
  }

  async grantBulkCoupon(dto: AdminGrantBulkCouponDto) {
    return this.adminCouponService.grantBulkCoupon(dto);
  }
}
