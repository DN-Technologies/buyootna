import { Body, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { AdminChangePlanDto } from '../dto/admin-change-plan.dto';
import {
  AdminCreateFeaturePackageDto,
  AdminUpdateFeaturePackageDto,
} from '../dto/admin-feature-package.dto';
import { AdminGrantExceptionalFeatureDto } from '../dto/admin-grant-exceptional-feature.dto';
import {
  AdminGrantCouponDto,
  AdminGrantBulkCouponDto,
} from '../dto/admin-grant-coupon.dto';
import { AdminUpdatePlanDto } from '../dto/admin-update-plan.dto';
import { AdminIdentityQueryDto } from '../dto/admin-identity-query.dto';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import { AdminApi } from './admin-api.decorator';

/** Wallets and plans, invoices, coupons, the plan catalogue and "feature this ad" packages. */
@AdminApi()
export class AdminBillingController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users/:id/wallet')
  @ApiOperation({
    summary:
      "Get a user's ad-credit wallet: balances, active plan slots, and history",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getWallet(
    @Param('id') id: string,
    @Query() { identityId }: AdminIdentityQueryDto,
  ) {
    return this.adminService.getWallet(id, identityId);
  }

  @Post('users/:id/plan')
  @ApiOperation({
    summary: "Change a user's plan by creating a new active plan slot",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async changePlan(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminChangePlanDto,
  ) {
    return this.adminService.changePlan(id, dto, reqUser.userId);
  }

  @Post('users/:id/exceptional-feature')
  @ApiOperation({
    summary: "Grant a user's account exceptional/promotional features",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async grantExceptionalFeature(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminGrantExceptionalFeatureDto,
  ) {
    return this.adminService.grantExceptionalFeature(id, dto, reqUser.userId);
  }

  @Get('users/:id/invoices')
  @ApiOperation({ summary: "List a user's invoices" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getInvoicesForUser(
    @Param('id') id: string,
    @Query() { identityId }: AdminIdentityQueryDto,
  ) {
    return this.adminService.getInvoicesForUser(id, identityId);
  }

  @Get('users/:id/coupons')
  @ApiOperation({ summary: "List a user's coupon-grant history" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getCouponHistoryForUser(@Param('id') id: string) {
    return this.adminService.getCouponHistoryForUser(id);
  }

  @Get('coupons')
  @ApiOperation({
    summary: 'Get available promotional discount coupons for user assignment',
  })
  @ApiResponse({ status: 200, description: 'Available promotional coupons' })
  @ApiCommonErrors()
  getAvailableCoupons() {
    return this.adminService.getAvailableCoupons();
  }

  @Get('plans')
  @ApiOperation({
    summary:
      'Every plan the app sells (active and hidden), with its packages and how often it was bought',
  })
  @ApiResponse({ status: 200, description: 'Plans' })
  @ApiCommonErrors()
  getPlanCatalog() {
    return this.adminService.getPlanCatalog();
  }

  @Patch('plans/:id')
  @ApiOperation({
    summary:
      'Edit a plan: name, price, hidden/active, ads, days, images, featured days, priority, feature lines',
  })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'The updated plan' })
  @ApiCommonErrors()
  updatePlan(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdatePlanDto,
  ) {
    return this.adminService.updatePlan(id, dto, reqUser.userId);
  }

  @Get('feature-packages')
  @ApiOperation({
    summary:
      'List every "feature this ad" package (active and inactive) with its price',
  })
  @ApiResponse({ status: 200, description: 'Feature packages' })
  @ApiCommonErrors()
  getFeaturePackages() {
    return this.adminService.getFeaturePackages();
  }

  @Post('feature-packages')
  @ApiOperation({ summary: 'Add a "feature this ad" package' })
  @ApiResponse({ status: 201, description: 'The created package' })
  @ApiCommonErrors()
  createFeaturePackage(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: AdminCreateFeaturePackageDto,
  ) {
    return this.adminService.createFeaturePackage(dto, reqUser.userId);
  }

  @Patch('feature-packages/:id')
  @ApiOperation({
    summary:
      'Edit a "feature this ad" package (price, label, days, order, or deactivate it)',
  })
  @ApiParam({ name: 'id', description: 'Feature package ID' })
  @ApiResponse({ status: 200, description: 'The updated package' })
  @ApiCommonErrors()
  updateFeaturePackage(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateFeaturePackageDto,
  ) {
    return this.adminService.updateFeaturePackage(id, dto, reqUser.userId);
  }

  @Post('users/bulk/coupon')
  @ApiOperation({
    summary:
      'Grant a promotional discount coupon code to multiple user accounts',
  })
  @ApiResponse({
    status: 201,
    description: 'Discount coupon granted to multiple users successfully',
  })
  @ApiCommonErrors()
  async grantBulkCoupon(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: AdminGrantBulkCouponDto,
  ) {
    return this.adminService.grantBulkCoupon(dto, reqUser.userId);
  }

  @Post('users/:id/coupon')
  @ApiOperation({
    summary: 'Grant a discount coupon code to a user account',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 201,
    description: 'Discount coupon granted to user successfully',
  })
  @ApiCommonErrors()
  async grantCoupon(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminGrantCouponDto,
  ) {
    return this.adminService.grantCoupon(id, dto, reqUser.userId);
  }
}
