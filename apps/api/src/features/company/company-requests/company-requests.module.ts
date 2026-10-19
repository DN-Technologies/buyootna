import { Module } from '@nestjs/common';
import { PushModule } from '../../../core/push/push.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { CompanyRequestsController } from './company-requests.controller';
import { CompanyRequestsService } from './company-requests.service';

@Module({
  imports: [NotificationsModule, PushModule],
  controllers: [CompanyRequestsController],
  providers: [CompanyRequestsService],
  exports: [CompanyRequestsService],
})
export class CompanyRequestsModule {}
