import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(user.id);
  }

  @Patch()
  async updateSettings(
    @CurrentUser() user: User,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(user.id, dto);
  }
}
