import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { Session } from '@prisma/client';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async getDevices(
    @CurrentUser() reqUser: RequestUser,
  ): Promise<Session[]> {
    return this.devicesService.getDevices(reqUser.userId);
  }

  @Delete(':id')
  async revokeDevice(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ): Promise<{ count: number }> {
    return this.devicesService.revokeDevice(reqUser.userId, id);
  }

  @Delete()
  async revokeAllDevices(
    @CurrentUser() reqUser: RequestUser,
  ): Promise<{ count: number }> {
    return this.devicesService.revokeAllExceptCurrent(reqUser.userId);
  }
}
