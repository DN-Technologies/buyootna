import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { AdminUsersFilterDto } from '../dto/admin-users-filter.dto';
import { AdminUpdateStatusDto } from '../dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from '../dto/admin-update-identity-status.dto';
import { AdminRequestIdentityEditDto } from '../dto/admin-request-identity-edit.dto';
import { AdminCreateIndividualDto } from '../dto/admin-create-individual.dto';
import { AdminNotifyUsersDto } from '../dto/admin-notify-users.dto';
import { AdminVerificationsFilterDto } from '../dto/admin-verifications-filter.dto';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import {
  AdminDeleteUserResponseDto,
  AdminNotifyUsersResponseDto,
  AdminResetPasswordResponseDto,
  AdminUpdateUserStatusResponseDto,
  AdminUsersListResponseDto,
} from '../dto/admin-response.dto';
import { AdminVerificationsListResponseDto } from '../dto/admin-verifications-response.dto';
import { IdentityResponseDto } from '../../identities/dto/identity-response.dto';
import { AdminApi } from './admin-api.decorator';

/** User accounts, company/office verification, notifications and password resets. */
@AdminApi()
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

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

  @Post('users/notify')
  @ApiOperation({
    summary:
      'Send a custom in-app and/or email notification to one or more users',
  })
  @ApiResponse({ status: 200, type: AdminNotifyUsersResponseDto })
  @ApiCommonErrors()
  async notifyUsers(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: AdminNotifyUsersDto,
  ): Promise<AdminNotifyUsersResponseDto> {
    return this.adminService.notifyUsers(dto, reqUser.userId);
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
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto, reqUser.userId);
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
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateIdentityStatusDto,
  ) {
    return this.adminService.updateIdentityStatus(id, dto, reqUser.userId);
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
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: AdminRequestIdentityEditDto,
  ) {
    return this.adminService.requestIdentityEdit(id, dto, reqUser.userId);
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
}
