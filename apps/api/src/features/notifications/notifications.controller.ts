import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAllForUser(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

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
