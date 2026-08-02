import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.findAllForUser(reqUser.userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.getUnreadCount(reqUser.userId);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.markAllAsRead(reqUser.userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(reqUser.userId, id);
  }

  @Get('preferences')
  async getPreferences(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.getPreferences(reqUser.userId);
  }

  @Patch('preferences')
  async updatePreferences(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    return this.notificationsService.updatePreferences(reqUser.userId, dto);
  }
}
