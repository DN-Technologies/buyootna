import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  NotificationPreferencesResponseDto,
  NotificationResponseDto,
  SuccessResponseDto,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';

@ApiTags('Notifications')
@ApiAuth()
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List all of the current user's notifications" })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  @ApiCommonErrors()
  async findAll(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.findAllForUser(reqUser.userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: "Get the current user's unread notification count" })
  @ApiResponse({ status: 200, type: UnreadCountResponseDto })
  @ApiCommonErrors()
  async getUnreadCount(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.getUnreadCount(reqUser.userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: "Mark all of the current user's notifications as read" })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  @ApiCommonErrors()
  async markAllAsRead(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.markAllAsRead(reqUser.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @ApiCommonErrors()
  async markAsRead(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(reqUser.userId, id);
  }

  @Get('preferences')
  @ApiOperation({ summary: "Get the current user's notification preferences" })
  @ApiResponse({ status: 200, type: NotificationPreferencesResponseDto })
  @ApiCommonErrors()
  async getPreferences(@CurrentUser() reqUser: RequestUser) {
    return this.notificationsService.getPreferences(reqUser.userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: "Update the current user's notification preferences" })
  @ApiResponse({ status: 200, type: NotificationPreferencesResponseDto })
  @ApiCommonErrors()
  async updatePreferences(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    return this.notificationsService.updatePreferences(reqUser.userId, dto);
  }
}
