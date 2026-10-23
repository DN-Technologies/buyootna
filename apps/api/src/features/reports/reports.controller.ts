import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateReportResponseDto } from './dto/report-response.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('users/:targetUserId/reports')
  @ApiAuth()
  @ApiOperation({
    summary: 'Submit a report against a target user account',
  })
  @ApiParam({ name: 'targetUserId', description: 'Target user or identity ID' })
  @ApiResponse({ status: 201, type: CreateReportResponseDto })
  @ApiCommonErrors()
  async create(
    @CurrentUser() reqUser: RequestUser,
    @Param('targetUserId') targetUserId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(
      reqUser.userId,
      reqUser.identityId,
      targetUserId,
      dto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('properties/:propertyId/reports')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Report a listing (إبلاغ عن الإعلان): a PROPERTY report against it and its owner; repeating while the first is pending returns it',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 201, type: CreateReportResponseDto })
  @ApiCommonErrors()
  reportProperty(
    @CurrentUser() reqUser: RequestUser,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createForProperty(
      { userId: reqUser.userId, identityId: reqUser.identityId },
      propertyId,
      dto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/reports')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Report a review: a report against its author, linked to the review; repeating while the first is pending returns it',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 201, type: CreateReportResponseDto })
  @ApiCommonErrors()
  reportReview(
    @CurrentUser() reqUser: RequestUser,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createForReview(
      { userId: reqUser.userId, identityId: reqUser.identityId },
      reviewId,
      dto,
    );
  }
}
