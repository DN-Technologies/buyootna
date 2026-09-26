import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { Session } from '@prisma/client';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  RevokeDeviceResponseDto,
  SessionResponseDto,
} from './dto/device-response.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';

@ApiTags('Devices')
@ApiAuth()
@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({
    summary: "List the current user's active login sessions/devices",
  })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  @ApiCommonErrors()
  async getDevices(
    @CurrentUser() reqUser: RequestUser,
  ): Promise<Omit<Session, 'pushToken'>[]> {
    return this.devicesService.getDevices(reqUser.userId);
  }

  @Patch('current/push-token')
  @ApiOperation({
    summary:
      "Register (or clear) this device's Expo push token on the caller's own session",
  })
  @ApiCommonErrors()
  async setPushToken(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdatePushTokenDto,
  ): Promise<{ success: boolean }> {
    return this.devicesService.setPushToken(
      reqUser.userId,
      reqUser.sessionId,
      dto.token,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a single device/session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, type: RevokeDeviceResponseDto })
  @ApiCommonErrors()
  async revokeDevice(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ): Promise<{ count: number }> {
    return this.devicesService.revokeDevice(reqUser.userId, id);
  }

  @Delete()
  @ApiOperation({
    summary:
      "Revoke all of the current user's other active sessions, keeping the most recent",
  })
  @ApiResponse({ status: 200, type: RevokeDeviceResponseDto })
  @ApiCommonErrors()
  async revokeAllDevices(
    @CurrentUser() reqUser: RequestUser,
  ): Promise<{ count: number }> {
    return this.devicesService.revokeAllExceptCurrent(
      reqUser.userId,
      reqUser.sessionId,
    );
  }
}
