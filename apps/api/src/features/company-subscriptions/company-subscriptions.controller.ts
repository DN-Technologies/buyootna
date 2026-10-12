import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CompanySubscriptionsService } from './company-subscriptions.service';
import { CompanyPlanDto, CompanySubscriptionStateDto } from './dto';

@ApiTags('Company subscriptions')
@Controller()
export class CompanySubscriptionsController {
  constructor(private readonly subscriptions: CompanySubscriptionsService) {}

  @Get('company-plans')
  @ApiOperation({ summary: 'List the subscription plans companies can buy' })
  @ApiResponse({ status: 200, type: [CompanyPlanDto] })
  @ApiCommonErrors()
  listPlans() {
    return this.subscriptions.listPlans();
  }

  @Get('company-subscriptions/me')
  @UseGuards(JwtAuthGuard)
  @ApiAuth()
  @ApiOperation({
    summary:
      "The current company persona's subscription: trial, active or expired",
  })
  @ApiResponse({ status: 200, type: CompanySubscriptionStateDto })
  @ApiCommonErrors()
  getMine(@CurrentUser() reqUser: RequestUser) {
    return this.subscriptions.getMine(reqUser.identityId, reqUser.identityType);
  }
}
