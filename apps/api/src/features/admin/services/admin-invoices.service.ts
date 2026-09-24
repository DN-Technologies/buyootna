import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { InvoicesService } from '../../invoices/invoices.service';

@Injectable()
export class AdminInvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async getInvoicesForUser(userId: string) {
    return this.invoicesService.findUserInvoices(userId);
  }

  async getCouponHistoryForUser(userId: string) {
    const rows = await this.prisma.adminActionLog.findMany({
      where: {
        targetUserId: userId,
        action: { in: ['COUPON_GRANTED', 'COUPON_BULK_GRANTED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => {
      const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
      return {
        id: row.id,
        couponCode:
          typeof metadata.couponCode === 'string' ? metadata.couponCode : '',
        couponName:
          typeof metadata.couponName === 'string' ? metadata.couponName : '',
        grantedAt: row.createdAt.toISOString(),
      };
    });
  }
}
