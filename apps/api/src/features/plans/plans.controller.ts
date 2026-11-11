import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscountPurpose, PlanAudience } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlansService, type PublishOptionsResponse } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  PackageHistoryItemDto,
  PlanDto,
  PublishOptionsResponseDto,
  UserWalletResponseDto,
} from './dto/plan-response.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'List all active subscription plans' })
  @ApiQuery({
    name: 'audience',
    required: false,
    enum: ['INDIVIDUAL', 'OFFICE'],
    description:
      "INDIVIDUAL (default, what older apps get) or OFFICE: offices' own plans",
  })
  @ApiResponse({ status: 200, type: [PlanDto] })
  @ApiCommonErrors()
  async findAll(@Query('audience') audience?: string) {
    return this.plansService.findAll(
      audience === 'OFFICE' ? PlanAudience.OFFICE : PlanAudience.INDIVIDUAL,
    );
  }

  // Before 'wallet' etc.: a static path, public like the list
  @Get('promo')
  @ApiOperation({
    summary:
      'The discount code advertised on «الباقات» (flagged by an admin, usable now), or null',
  })
  @ApiQuery({
    name: 'purpose',
    required: false,
    enum: ['PLAN', 'SUBSCRIPTION'],
    description: 'PLAN (ad packages, default) or SUBSCRIPTION (company plans)',
  })
  @ApiCommonErrors()
  async getPromo(@Query('purpose') purpose?: string) {
    return this.plansService.getPromo(
      purpose === 'SUBSCRIPTION'
        ? DiscountPurpose.SUBSCRIPTION
        : DiscountPurpose.PLAN,
    );
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiAuth()
  @ApiOperation({
    summary:
      "Get the current user's ad-credit wallet: balances, active slots, and history",
  })
  @ApiResponse({ status: 200, type: UserWalletResponseDto })
  @ApiCommonErrors()
  async getUserWallet(@CurrentUser() reqUser: RequestUser) {
    return this.plansService.getWallet(reqUser.identityId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiAuth()
  @ApiOperation({ summary: "Get the current user's package purchase history" })
  @ApiResponse({ status: 200, type: [PackageHistoryItemDto] })
  @ApiCommonErrors()
  async getPackageHistory(@CurrentUser() reqUser: RequestUser) {
    return this.plansService.getPackageHistory(reqUser.identityId);
  }

  @Get('wallet/publish-options')
  @UseGuards(JwtAuthGuard)
  @ApiAuth()
  @ApiOperation({
    summary:
      "Get the current user's available options for publishing a new listing",
  })
  @ApiResponse({ status: 200, type: PublishOptionsResponseDto })
  @ApiCommonErrors()
  async getPublishOptions(
    @CurrentUser() reqUser: RequestUser,
  ): Promise<PublishOptionsResponse> {
    return this.plansService.getPublishOptions(reqUser.identityId);
  }
}
