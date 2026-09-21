import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { CompaniesService } from './companies.service';
import { CompanyDashboardResponseDto } from './dto/company-dashboard-response.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me/dashboard')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({
    summary:
      "Get the current company identity's home-dashboard stats: active listings, lifetime views, and billing/plan state",
  })
  @ApiResponse({ status: 200, type: CompanyDashboardResponseDto })
  @ApiCommonErrors()
  async getDashboard(@CurrentUser() reqUser: RequestUser) {
    return this.companiesService.getDashboard(reqUser.identityId);
  }
}
