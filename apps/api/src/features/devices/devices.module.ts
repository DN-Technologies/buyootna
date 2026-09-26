import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { LoginAlertService } from './login-alert.service';
import { SessionsService } from './sessions.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DevicesController],
  providers: [DevicesService, SessionsService, LoginAlertService],
  exports: [DevicesService, SessionsService, LoginAlertService],
})
export class DevicesModule {}
