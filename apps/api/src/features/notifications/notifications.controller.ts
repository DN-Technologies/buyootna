import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  async getPreferences(@CurrentUser() user: User) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Patch('preferences')
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    return this.notificationsService.updatePreferences(user.id, dto);
  }
}
