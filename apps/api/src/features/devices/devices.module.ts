import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, SessionsService],
  exports: [DevicesService, SessionsService],
})
export class DevicesModule {}
