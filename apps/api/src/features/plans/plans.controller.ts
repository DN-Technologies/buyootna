import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlansService, type PublishOption } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll() {
    return this.plansService.findAll();
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  async getUserWallet(@CurrentUser() user: User) {
    return this.plansService.getUserWallet(user.id);
  }

  @Get('wallet/publish-options')
  @UseGuards(JwtAuthGuard)
  async getPublishOptions(@CurrentUser() user: User): Promise<PublishOption[]> {
    return this.plansService.getPublishOptions(user.id);
  }
}
