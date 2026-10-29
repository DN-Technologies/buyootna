import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { OfficeDashboardResponseDto } from './dto/office-dashboard-response.dto';
import { OfficesService } from './offices.service';

@ApiTags('Offices')
@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get('me/dashboard')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({
    summary:
      "Get the current office identity's home dashboard: stats, ad-package state, its active ads and its services",
  })
  @ApiResponse({ status: 200, type: OfficeDashboardResponseDto })
  @ApiResponse({
    status: 403,
    description: 'The active persona is not an office',
  })
  @ApiCommonErrors()
  async getDashboard(@CurrentUser() reqUser: RequestUser) {
    return this.officesService.getDashboard(
      reqUser.identityId,
      reqUser.identityType,
    );
  }
}
