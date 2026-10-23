import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { AdminReportsFilterDto } from '../dto/admin-reports-filter.dto';
import { AdminReportUpdateDto } from '../dto/admin-report-update.dto';
import { AdminReportsBulkDto } from '../dto/admin-reports-bulk.dto';
import { AdminRemovePropertyDto } from '../dto/admin-remove-property.dto';
import { AdminUpdatePropertyDto } from '../dto/admin-update-property.dto';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import { AdminReportsListResponseDto } from '../dto/admin-reports-response.dto';
import { AdminModeratorDto } from '../dto/admin-moderator.dto';
import { AdminApi } from './admin-api.decorator';

/** Reports (list, review, resolve/dismiss, «حذف المحتوى وإيقاف الحساب») and moderated listings. */
@AdminApi()
export class AdminModerationController {
  constructor(private readonly adminService: AdminService) {}

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

  @Post('reports/:id/enforce')
  @ApiOperation({
    summary:
      '«حذف المحتوى وإيقاف الحساب»: remove the reported listing/review/story, suspend the account that posted it, and resolve the report (Guideline 1.2)',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiCommonErrors()
  async enforceReport(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.adminService.enforceReport(id, reqUser.userId);
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

  @Get('moderators')
  @ApiOperation({
    summary: 'List admin accounts assignable as a report moderator',
  })
  @ApiResponse({ status: 200, type: [AdminModeratorDto] })
  @ApiCommonErrors()
  async getAssignableAdmins() {
    return this.adminService.getAssignableAdmins();
  }
}
