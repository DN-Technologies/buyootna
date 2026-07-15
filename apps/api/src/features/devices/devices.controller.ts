import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User, Session } from '@prisma/client';

@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async getDevices(@CurrentUser() user: User): Promise<Session[]> {
    return this.devicesService.getDevices(user.id);
  }

  @Delete(':id')
  async revokeDevice(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ count: number }> {
    return this.devicesService.revokeDevice(user.id, id);
  }

  @Delete()
  async revokeAllDevices(
    @CurrentUser() user: User,
  ): Promise<{ count: number }> {
    return this.devicesService.revokeAllExceptCurrent(user.id);
  }
}
