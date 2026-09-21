import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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
}
