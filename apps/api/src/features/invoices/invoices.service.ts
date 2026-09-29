import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Invoice } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /** One persona's invoices. */
  async findIdentityInvoices(identityId: string): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { identityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Every persona of an account (the admin's view of a user). */
  async findUserInvoices(userId: string): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { identity: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
