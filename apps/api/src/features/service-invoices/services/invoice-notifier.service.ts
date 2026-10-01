import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PushService } from '../../../core/push/push.service';
import { NotificationsService } from '../../notifications/notifications.service';

/**
 * Tells the client about an invoice addressed to them: an in-app
 * notification (scoped to the client persona) plus a push to their devices.
 * Never throws -- a failed notice must not fail creating or paying.
 */
@Injectable()
export class InvoiceNotifierService {
  private readonly logger = new Logger(InvoiceNotifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  async notify(
    invoice: { id: string; invoiceNo: string; clientIdentityId: string | null },
    companyName: string,
    event: 'issued' | 'paid',
  ) {
    if (!invoice.clientIdentityId) return;
    try {
      const client = await this.prisma.identity.findUnique({
        where: { id: invoice.clientIdentityId },
        select: { userId: true },
      });
      if (!client) return;

      const title =
        event === 'issued' ? 'فاتورة خدمة جديدة' : 'تم تأكيد دفع الفاتورة';
      const body =
        event === 'issued'
          ? `أصدرت ${companyName} الفاتورة ${invoice.invoiceNo}`
          : `أكدت ${companyName} استلام دفع الفاتورة ${invoice.invoiceNo}`;

      await this.notifications.create({
        userId: client.userId,
        type: 'SERVICE_INVOICE',
        title,
        body,
        identityId: invoice.clientIdentityId,
        data: { invoiceId: invoice.id },
      });

      const sessions = await this.prisma.session.findMany({
        where: { userId: client.userId, pushToken: { not: null } },
        select: { pushToken: true },
      });
      await this.push.sendToTokens(
        sessions.map((s) => s.pushToken).filter((t): t is string => !!t),
        {
          title,
          body,
          data: {
            type: 'SERVICE_INVOICE',
            route: '/service-invoices',
            invoiceId: invoice.id,
          },
        },
      );
    } catch (err) {
      this.logger.error(`Invoice notice ${invoice.id} failed`, err as Error);
    }
  }
}
