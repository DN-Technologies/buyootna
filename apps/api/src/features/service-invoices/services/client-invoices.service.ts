import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ListServiceInvoicesDto } from '../dto/list-service-invoices.dto';
import { INVOICE_INCLUDE, toInvoiceView } from '../service-invoice.view';
import { invoiceListQuery } from './invoice-search';

/**
 * The client's side of فواتير الخدمات: the invoices companies addressed to
 * the persona the request is signed in as. Deleting only hides one from
 * this client's list; the company keeps its copy.
 */
@Injectable()
export class ClientInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private visibleTo(identityId: string) {
    return { clientIdentityId: identityId, clientDeletedAt: null };
  }

  async list(identityId: string, query: ListServiceInvoicesDto = {}) {
    const { where, orderBy } = invoiceListQuery(
      query.search,
      query.sort,
      'company',
    );
    const invoices = await this.prisma.companyInvoice.findMany({
      where: { ...where, ...this.visibleTo(identityId) },
      orderBy,
      include: INVOICE_INCLUDE,
    });
    return invoices.map(toInvoiceView);
  }

  async get(identityId: string, invoiceId: string) {
    const invoice = await this.prisma.companyInvoice.findFirst({
      where: { id: invoiceId, ...this.visibleTo(identityId) },
      include: INVOICE_INCLUDE,
    });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    return toInvoiceView(invoice);
  }

  async remove(identityId: string, invoiceId: string) {
    const { count } = await this.prisma.companyInvoice.updateMany({
      where: { id: invoiceId, ...this.visibleTo(identityId) },
      data: { clientDeletedAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('الفاتورة غير موجودة');
    return { success: true, message: 'تم حذف الفاتورة من سجلك' };
  }
}
