import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlansService, type PublishOptionsResponse } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll() {
    return this.plansService.findAll();
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  async getUserWallet(@CurrentUser() reqUser: RequestUser) {
    return this.plansService.getUserWallet(reqUser.userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPackageHistory(@CurrentUser() reqUser: RequestUser) {
    return this.plansService.getPackageHistory(reqUser.userId);
  }

  @Get('wallet/publish-options')
  @UseGuards(JwtAuthGuard)
  async getPublishOptions(
    @CurrentUser() reqUser: RequestUser,
  ): Promise<PublishOptionsResponse> {
    return this.plansService.getPublishOptions(reqUser.userId);
  }
}
