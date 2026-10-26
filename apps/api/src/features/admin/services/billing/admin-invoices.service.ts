import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { InvoicesService } from '../../../invoices/invoices.service';
import { findOwnedIdentity } from '../users/admin-persona.util';

@Injectable()
export class AdminInvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  // One persona's invoices, or all of the account's
  async getInvoicesForUser(userId: string, identityId?: string) {
    if (!identityId) return this.invoicesService.findUserInvoices(userId);
    await findOwnedIdentity(this.prisma, userId, identityId);
    return this.prisma.invoice.findMany({
      where: { identityId },
      orderBy: { createdAt: 'desc' },
    });
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
