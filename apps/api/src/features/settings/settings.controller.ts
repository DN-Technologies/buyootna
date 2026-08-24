import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { SettingsResponseDto } from './dto/settings-response.dto';

@ApiTags('Settings')
@ApiAuth()
@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get the current user's privacy settings (creates defaults if none exist)",
  })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  @ApiCommonErrors()
  async getSettings(@CurrentUser() reqUser: RequestUser) {
    return this.settingsService.getSettings(reqUser.userId);
  }

  @Patch()
  @ApiOperation({ summary: "Update the current user's privacy settings" })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  @ApiCommonErrors()
  async updateSettings(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(reqUser.userId, dto);
  }
}
