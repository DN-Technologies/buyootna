import { Module } from '@nestjs/common';
import { PushModule } from '../../core/push/push.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServiceInvoicesController } from './service-invoices.controller';
import { ClientInvoicesService } from './services/client-invoices.service';
import { CompanyInvoicesService } from './services/company-invoices.service';
import { InvoiceNotifierService } from './services/invoice-notifier.service';

/**
 * فواتير الخدمات. The client routes live here; the company routes stay at
 * /users/profile/invoices (CompanyController, in UsersModule), which uses
 * the exported CompanyInvoicesService.
 */
@Module({
  imports: [NotificationsModule, PushModule],
  controllers: [ServiceInvoicesController],
  providers: [
    ClientInvoicesService,
    CompanyInvoicesService,
    InvoiceNotifierService,
  ],
  exports: [CompanyInvoicesService],
})
export class ServiceInvoicesModule {}
