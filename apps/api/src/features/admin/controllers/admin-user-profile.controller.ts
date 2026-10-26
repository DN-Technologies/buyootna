import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { AdminService } from '../admin.service';
import {
  AdminGetReviewsDto,
  AdminIdentityQueryDto,
} from '../dto/admin-identity-query.dto';
import { AdminCreateNoteDto, AdminUpdateNoteDto } from '../dto/admin-note.dto';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import { AdminApi } from './admin-api.decorator';

/** The tabs of a user's detail page: requests, portfolio, reviews, audit log and internal notes. */
@AdminApi()
export class AdminUserProfileController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users/:id/requests')
  @ApiOperation({
    summary:
      "List a user's company-requests -- as the submitter (individual) or as the target/accepter (company/office)",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getRequestsForUser(
    @Param('id') id: string,
    @Query() { identityId }: AdminIdentityQueryDto,
  ) {
    return this.adminService.getRequestsForUser(id, identityId);
  }

  @Get('users/:id/projects')
  @ApiOperation({
    summary: "List a company user's portfolio (exhibition) projects",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getProjectsForUser(
    @Param('id') id: string,
    @Query() { identityId }: AdminIdentityQueryDto,
  ) {
    return this.adminService.getProjectsForUser(id, identityId);
  }

  @Get('users/:id/services')
  @ApiOperation({
    summary:
      "A company's services (CompanyService rows) or an office's listed services, for the user page's الخدمات tab",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getServicesForUser(
    @Param('id') id: string,
    @Query() { identityId }: AdminIdentityQueryDto,
  ) {
    return this.adminService.getServicesForUser(id, identityId);
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

  @Get('users/:id/reviews')
  @ApiOperation({ summary: "List a user's received reviews" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getReviewsForUser(
    @Param('id') id: string,
    @Query() { identityId, ...query }: AdminGetReviewsDto,
  ) {
    return this.adminService.getReviewsForUser(id, query, identityId);
  }

  @Get('users/:id/reviews/summary')
  @ApiOperation({
    summary: "Get a user's review summary (average, total, breakdown)",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getReviewsSummaryForUser(
    @Param('id') id: string,
    @Query() { identityId }: AdminIdentityQueryDto,
  ) {
    return this.adminService.getReviewsSummaryForUser(id, identityId);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Permanently delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiCommonErrors()
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  @Get('users/:id/logs')
  @ApiOperation({
    summary: "Paginated audit-log entries for a user's detail page",
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiCommonErrors()
  async getLogsForUser(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getLogsForUser(
      id,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
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
}
