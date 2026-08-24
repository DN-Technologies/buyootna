import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, type: [PlanDto] })
  @ApiCommonErrors()
  async findAll() {
    return this.plansService.findAll();
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
    return this.plansService.getUserWallet(reqUser.userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiAuth()
  @ApiOperation({ summary: "Get the current user's package purchase history" })
  @ApiResponse({ status: 200, type: [PackageHistoryItemDto] })
  @ApiCommonErrors()
  async getPackageHistory(@CurrentUser() reqUser: RequestUser) {
    return this.plansService.getPackageHistory(reqUser.userId);
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
    return this.plansService.getPublishOptions(reqUser.userId);
  }
}
