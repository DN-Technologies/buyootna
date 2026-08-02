import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@CurrentUser() reqUser: RequestUser) {
    return this.settingsService.getSettings(reqUser.userId);
  }

  @Patch()
  async updateSettings(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(reqUser.userId, dto);
  }
}
