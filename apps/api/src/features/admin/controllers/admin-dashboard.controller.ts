import { Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import { AdminUsersFilterDto } from '../dto/admin-users-filter.dto';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import { AdminDashboardResponseDto } from '../dto/admin-dashboard-response.dto';
import { AdminLogsFilterDto } from '../dto/admin-logs-filter.dto';
import { AdminApi } from './admin-api.decorator';

/** Dashboard stats, the platform's admin activity log and the users CSV export (/admin/users/export must be routed before /admin/users/:id, so this controller is registered first). */
@AdminApi()
export class AdminDashboardController {
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

  @Get('logs')
  @ApiOperation({
    summary:
      'Every admin action (the audit log), newest first, with the acting admin and the target user; optional action filter',
  })
  @ApiCommonErrors()
  async getLogs(@Query() { page, limit, action }: AdminLogsFilterDto) {
    return this.adminService.getLogs(page, limit, action);
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
}
