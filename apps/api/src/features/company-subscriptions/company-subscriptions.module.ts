import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { CompanySubscriptionRemindersService } from './company-subscription-reminders.service';
import { CompanySubscriptionsController } from './company-subscriptions.controller';
import { CompanySubscriptionsService } from './company-subscriptions.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CompanySubscriptionsController],
  providers: [CompanySubscriptionsService, CompanySubscriptionRemindersService],
})
export class CompanySubscriptionsModule {}
