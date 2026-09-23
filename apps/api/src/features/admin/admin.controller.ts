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
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
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
import { AdminRequestIdentityEditDto } from './dto/admin-request-identity-edit.dto';
import { AdminCreateIndividualDto } from './dto/admin-create-individual.dto';
import { AdminNotifyUsersDto } from './dto/admin-notify-users.dto';
import { AdminVerificationsFilterDto } from './dto/admin-verifications-filter.dto';
import { AdminReportsFilterDto } from './dto/admin-reports-filter.dto';
import { AdminReportUpdateDto } from './dto/admin-report-update.dto';
import { AdminReportsBulkDto } from './dto/admin-reports-bulk.dto';
import { AdminRemovePropertyDto } from './dto/admin-remove-property.dto';
import { AdminUpdatePropertyDto } from './dto/admin-update-property.dto';
import { AdminChangePlanDto } from './dto/admin-change-plan.dto';
import { AdminGrantExceptionalFeatureDto } from './dto/admin-grant-exceptional-feature.dto';
import { GetReviewsDto } from '../reviews/dto/get-reviews.dto';
import { AdminCreateNoteDto, AdminUpdateNoteDto } from './dto/admin-note.dto';
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
  AdminNotifyUsersResponseDto,
  AdminResetPasswordResponseDto,
  AdminUpdateUserStatusResponseDto,
  AdminUsersListResponseDto,
} from './dto/admin-response.dto';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import { AdminVerificationsListResponseDto } from './dto/admin-verifications-response.dto';
import { AdminReportsListResponseDto } from './dto/admin-reports-response.dto';
import { AdminModeratorDto } from './dto/admin-moderator.dto';
import { IdentityResponseDto } from '../identities/dto/identity-response.dto';

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

  @Get('verifications')
  @ApiOperation({
    summary:
      'List company/office verification requests, paginated/filterable, with status counts and today stats',
  })
  @ApiResponse({ status: 200, type: AdminVerificationsListResponseDto })
  @ApiCommonErrors()
  async getVerifications(@Query() filters: AdminVerificationsFilterDto) {
    return this.adminService.getVerifications(filters);
  }

  @Get('reports')
  @ApiOperation({
    summary:
      'List moderation reports, paginated/filterable, with status/priority/date filters and stats',
  })
  @ApiResponse({ status: 200, type: AdminReportsListResponseDto })
  @ApiCommonErrors()
  async getReports(@Query() filters: AdminReportsFilterDto) {
    return this.adminService.getReports(filters);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get a single report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiCommonErrors()
  async getReportById(@Param('id') id: string) {
    return this.adminService.getReportById(id);
  }

  @Patch('reports/:id')
  @ApiOperation({
    summary: "Update a report's status (resolve/dismiss) and/or priority",
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiCommonErrors()
  async updateReport(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminReportUpdateDto,
  ) {
    return this.adminService.updateReport(id, dto, reqUser.userId);
  }

  @Post('reports/bulk-resolve')
  @ApiOperation({ summary: 'Resolve multiple reports at once' })
  @ApiCommonErrors()
  async bulkResolveReports(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: AdminReportsBulkDto,
  ) {
    return this.adminService.resolveReports(dto.ids, reqUser.userId);
  }

  @Post('reports/bulk-dismiss')
  @ApiOperation({ summary: 'Dismiss multiple reports at once' })
  @ApiCommonErrors()
  async bulkDismissReports(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: AdminReportsBulkDto,
  ) {
    return this.adminService.dismissReports(dto.ids, reqUser.userId);
  }

  @Get('users/:id/reports')
  @ApiOperation({ summary: 'List reports filed against a specific user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getReportsForUser(
    @Param('id') id: string,
    @Query() filters: AdminReportsFilterDto,
  ) {
    return this.adminService.getReportsForUser(id, filters);
  }

  @Get('properties/:id/reports')
  @ApiOperation({ summary: 'List reports filed against a specific property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiCommonErrors()
  async getReportsForProperty(@Param('id') id: string) {
    return this.adminService.getReportsForProperty(id);
  }

  @Delete('properties/:id')
  @ApiOperation({
    summary: 'Permanently delete a reported property (admin moderation action)',
  })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiCommonErrors()
  async removeReportedProperty(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminRemovePropertyDto,
  ) {
    return this.adminService.removeReportedProperty(
      id,
      dto?.reason,
      reqUser.userId,
    );
  }

  @Patch('properties/:id')
  @ApiOperation({
    summary:
      "Update a property's moderation flags (hide/unhide, feature, status) as an admin action",
  })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiCommonErrors()
  async updateProperty(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdatePropertyDto,
  ) {
    return this.adminService.updateProperty(id, dto, reqUser.userId);
  }

  @Get('users/:id/requests')
  @ApiOperation({
    summary:
      "List a user's company-requests -- as the submitter (individual) or as the target/accepter (company/office)",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getRequestsForUser(@Param('id') id: string) {
    return this.adminService.getRequestsForUser(id);
  }

  @Get('users/:id/projects')
  @ApiOperation({
    summary: "List a company user's portfolio (exhibition) projects",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getProjectsForUser(@Param('id') id: string) {
    return this.adminService.getProjectsForUser(id);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Permanently delete a portfolio project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiCommonErrors()
  async deleteProject(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.adminService.deleteProject(id, reqUser.userId);
  }

  @Get('users/:id/wallet')
  @ApiOperation({
    summary:
      "Get a user's ad-credit wallet: balances, active plan slots, and history",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getWallet(@Param('id') id: string) {
    return this.adminService.getWallet(id);
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
  async getInvoicesForUser(@Param('id') id: string) {
    return this.adminService.getInvoicesForUser(id);
  }

  @Get('users/:id/coupons')
  @ApiOperation({ summary: "List a user's coupon-grant history" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getCouponHistoryForUser(@Param('id') id: string) {
    return this.adminService.getCouponHistoryForUser(id);
  }

  @Get('users/:id/reviews')
  @ApiOperation({ summary: "List a user's received reviews" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getReviewsForUser(
    @Param('id') id: string,
    @Query() query: GetReviewsDto,
  ) {
    return this.adminService.getReviewsForUser(id, query);
  }

  @Get('users/:id/reviews/summary')
  @ApiOperation({
    summary: "Get a user's review summary (average, total, breakdown)",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getReviewsSummaryForUser(@Param('id') id: string) {
    return this.adminService.getReviewsSummaryForUser(id);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Permanently delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiCommonErrors()
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  @Get('users/:id/notes')
  @ApiOperation({ summary: 'List internal admin notes for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getNotesForUser(@Param('id') id: string) {
    return this.adminService.getNotesForUser(id);
  }

  @Post('users/:id/notes')
  @ApiOperation({ summary: 'Create an internal admin note for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async createNote(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminCreateNoteDto,
  ) {
    return this.adminService.createNote(id, dto, reqUser.userId);
  }

  @Patch('notes/:id')
  @ApiOperation({ summary: 'Update an internal admin note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiCommonErrors()
  async updateNote(@Param('id') id: string, @Body() dto: AdminUpdateNoteDto) {
    return this.adminService.updateNote(id, dto);
  }

  @Delete('notes/:id')
  @ApiOperation({ summary: 'Delete an internal admin note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiCommonErrors()
  async deleteNote(@Param('id') id: string) {
    return this.adminService.deleteNote(id);
  }

  @Get('moderators')
  @ApiOperation({
    summary: 'List admin accounts assignable as a report moderator',
  })
  @ApiResponse({ status: 200, type: [AdminModeratorDto] })
  @ApiCommonErrors()
  async getAssignableAdmins() {
    return this.adminService.getAssignableAdmins();
  }

  @Post('users/notify')
  @ApiOperation({
    summary:
      'Send a custom in-app and/or email notification to one or more users',
  })
  @ApiResponse({ status: 200, type: AdminNotifyUsersResponseDto })
  @ApiCommonErrors()
  async notifyUsers(
    @Body() dto: AdminNotifyUsersDto,
  ): Promise<AdminNotifyUsersResponseDto> {
    return this.adminService.notifyUsers(dto);
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
      "Update an identity's approval status (e.g. company/office verification), optionally with a rejection reason and notify-channel choices",
  })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiResponse({ status: 200, type: IdentityResponseDto })
  @ApiCommonErrors()
  async updateIdentityStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateIdentityStatusDto,
  ) {
    return this.adminService.updateIdentityStatus(id, dto);
  }

  @Post('identities/:id/request-edit')
  @ApiOperation({
    summary:
      'Send a company/office identity back for corrections -- keeps it PENDING and notifies the owner with the given notes',
  })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiResponse({ status: 201, type: IdentityResponseDto })
  @ApiCommonErrors()
  async requestIdentityEdit(
    @Param('id') id: string,
    @Body() dto: AdminRequestIdentityEditDto,
  ) {
    return this.adminService.requestIdentityEdit(id, dto);
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
  getAvailableCoupons() {
    return this.adminService.getAvailableCoupons();
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
