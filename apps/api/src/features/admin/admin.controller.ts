import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import { AdminUpdateStatusDto } from './dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from './dto/admin-update-identity-status.dto';
import { AdminCreateIndividualDto } from './dto/admin-create-individual.dto';
import {
  AdminGrantCouponDto,
  AdminGrantBulkCouponDto,
} from './dto/admin-grant-coupon.dto';
import { AdminGuard } from './guards/admin.guard';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { ApiErrorResponseDto } from '../../core/swagger/api-error-response.dto';
import {
  AdminDeleteUserResponseDto,
  AdminResetPasswordResponseDto,
  AdminUpdateIdentityStatusResponseDto,
  AdminUpdateUserStatusResponseDto,
  AdminUsersListResponseDto,
} from './dto/admin-response.dto';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';

@ApiTags('Admin')
@ApiAuth()
@ApiForbiddenResponse({
  description: 'Admin access required',
  type: ApiErrorResponseDto,
})
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Get platform-wide admin dashboard stats: user/revenue metrics, users-by-type breakdown, monthly revenue, recent registrations, and pending company/office verifications',
  })
  @ApiResponse({ status: 200, type: AdminDashboardResponseDto })
  @ApiCommonErrors()
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({
    summary: 'List users, paginated/filterable, with account stats and counts',
  })
  @ApiResponse({ status: 200, type: AdminUsersListResponseDto })
  @ApiCommonErrors()
  async getUsers(@Query() filters: AdminUsersFilterDto) {
    return this.adminService.getUsers(filters);
  }

  @Post('users/individual')
  @ApiOperation({ summary: 'Create a new individual user account by admin' })
  @ApiResponse({
    status: 201,
    description: 'Individual user created successfully',
  })
  @ApiCommonErrors()
  async createIndividual(@Body() dto: AdminCreateIndividualDto) {
    return this.adminService.createIndividual(dto);
  }

  @Get('users/export')
  @ApiOperation({ summary: 'Export filtered users list to CSV' })
  @ApiCommonErrors()
  async exportUsers(
    @Query() filters: AdminUsersFilterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.adminService.exportUsersCsv(filters);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="buyootna-users.csv"',
    );
    return csv;
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Get full details for a single user, including identities',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    schema: { type: 'object', additionalProperties: true },
  })
  @ApiCommonErrors()
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({
    summary: "Update a user's account status (active/blocked/suspended)",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: AdminUpdateUserStatusResponseDto })
  @ApiCommonErrors()
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Permanently delete a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: AdminDeleteUserResponseDto })
  @ApiCommonErrors()
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('identities/:id/status')
  @ApiOperation({
    summary:
      "Update an identity's approval status (e.g. company/office verification)",
  })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiResponse({ status: 200, type: AdminUpdateIdentityStatusResponseDto })
  @ApiCommonErrors()
  async updateIdentityStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateIdentityStatusDto,
  ) {
    return this.adminService.updateIdentityStatus(id, dto);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({
    summary:
      'Send a password reset link to a user via email (valid for 60 minutes)',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 201, type: AdminResetPasswordResponseDto })
  @ApiCommonErrors()
  async sendUserPasswordResetLink(@Param('id') id: string) {
    return this.adminService.sendUserPasswordResetLink(id);
  }

  @Get('coupons')
  @ApiOperation({
    summary: 'Get available promotional discount coupons for user assignment',
  })
  @ApiResponse({ status: 200, description: 'Available promotional coupons' })
  @ApiCommonErrors()
  async getAvailableCoupons() {
    return this.adminService.getAvailableCoupons();
  }

  @Post('users/bulk/coupon')
  @ApiOperation({
    summary: 'Grant a promotional discount coupon code to multiple user accounts',
  })
  @ApiResponse({
    status: 201,
    description: 'Discount coupon granted to multiple users successfully',
  })
  @ApiCommonErrors()
  async grantBulkCoupon(@Body() dto: AdminGrantBulkCouponDto) {
    return this.adminService.grantBulkCoupon(dto);
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
    @Param('id') id: string,
    @Body() dto: AdminGrantCouponDto,
  ) {
    return this.adminService.grantCoupon(id, dto);
  }
}

