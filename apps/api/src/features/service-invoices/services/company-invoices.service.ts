import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateCompanyInvoiceDto } from '../../company/dto/create-company-invoice.dto';
import { assertApprovedProvider } from '../../identities/persona-rules';
import { ListServiceInvoicesDto } from '../dto/list-service-invoices.dto';
import { INVOICE_INCLUDE, toInvoiceView } from '../service-invoice.view';
import { invoiceListQuery } from './invoice-search';
import { InvoiceNotifierService } from './invoice-notifier.service';

// The name a persona shows: its individual / company / office name
type ClientPersona = {
  individualData: { name: string | null } | null;
  companyData: { name: string } | null;
  officeData: { name: string } | null;
  user: { name: string | null };
};
function personaName(p: ClientPersona): string {
  return (
    p.individualData?.name ||
    p.companyData?.name ||
    p.officeData?.name ||
    p.user.name ||
    'عميل'
  );
}

/**
 * The company's side of فواتير الخدمات: issue an invoice (to a client picked
 * from its accepted requests, or to a name typed for someone outside the
 * app), list what it issued, and mark one paid. Always scoped to the
 * company persona the request is signed in as.
 */
@Injectable()
export class CompanyInvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifier: InvoiceNotifierService,
  ) {}

  private async companyOf(identityId: string) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      include: { companyData: true },
    });
    if (!identity || identity.type !== 'COMPANY' || !identity.companyData) {
      throw new NotFoundException('الملف الشخصي للشركة غير موجود');
    }
    return identity;
  }

  /** The accepted request this company may invoice, with its client. */
  private async acceptedRequest(requestId: string, companyIdentityId: string) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        acceptedByIdentityId: true,
        clientIdentityId: true,
        clientIdentity: {
          select: {
            individualData: { select: { name: true } },
            companyData: { select: { name: true } },
            officeData: { select: { name: true } },
            user: { select: { name: true } },
          },
        },
      },
    });
    if (
      !request ||
      request.status !== RequestStatus.ACCEPTED ||
      request.acceptedByIdentityId !== companyIdentityId
    ) {
      throw new BadRequestException('يمكن إصدار الفاتورة فقط لطلب قبلته شركتك');
    }
    return request;
  }

  async create(identityId: string, dto: CreateCompanyInvoiceDto) {
    const company = await this.companyOf(identityId);
    await assertApprovedProvider(this.prisma, identityId);

    let clientIdentityId: string | null = null;
    let clientName = dto.clientName?.trim() ?? '';
    if (dto.requestId) {
      const request = await this.acceptedRequest(dto.requestId, identityId);
      clientIdentityId = request.clientIdentityId;
      clientName = personaName(request.clientIdentity);
    }
    if (!clientName) {
      throw new BadRequestException('اسم العميل مطلوب');
    }

    // Server-side totals -- the client's numbers are never trusted
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const discount = Math.min(dto.discount ?? 0, subtotal);
    const total = subtotal - discount;

    const invoice = await this.prisma.companyInvoice.create({
      data: {
        identityId,
        invoiceNo: await this.generateInvoiceNo(),
        clientName,
        clientIdentityId,
        requestId: dto.requestId ?? null,
        title: dto.title,
        warrantyMonths: dto.warrantyMonths,
        issueDate: new Date(dto.issueDate),
        items: dto.items as unknown as Prisma.InputJsonValue,
        subtotal,
        discount,
        total,
      },
      include: INVOICE_INCLUDE,
    });

    void this.notifier.notify(invoice, company.companyData!.name, 'issued');
    return { success: true, invoice: toInvoiceView(invoice) };
  }

  /** The clients this company can invoice: its accepted requests. */
  async invoiceableRequests(identityId: string) {
    await this.companyOf(identityId);
    const requests = await this.prisma.companyRequest.findMany({
      where: {
        acceptedByIdentityId: identityId,
        status: RequestStatus.ACCEPTED,
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        clientIdentity: {
          select: {
            individualData: { select: { name: true } },
            companyData: { select: { name: true } },
            officeData: { select: { name: true } },
            user: { select: { name: true } },
          },
        },
      },
    });
    return requests.map((r) => ({
      requestId: r.id,
      title: r.title,
      clientName: personaName(r.clientIdentity),
      acceptedAt: r.updatedAt,
    }));
  }

  async list(identityId: string, query: ListServiceInvoicesDto = {}) {
    await this.companyOf(identityId);
    const { where, orderBy } = invoiceListQuery(
      query.search,
      query.sort,
      'client',
    );
    const invoices = await this.prisma.companyInvoice.findMany({
      where: { ...where, identityId },
      orderBy,
      include: INVOICE_INCLUDE,
    });
    return invoices.map(toInvoiceView);
  }

  /** Records that the client paid; a second call changes nothing. */
  async markPaid(identityId: string, invoiceId: string) {
    const company = await this.companyOf(identityId);
    const invoice = await this.prisma.companyInvoice.findFirst({
      where: { id: invoiceId, identityId },
      include: INVOICE_INCLUDE,
    });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    if (invoice.paidAt) return toInvoiceView(invoice);

    const paid = await this.prisma.companyInvoice.update({
      where: { id: invoice.id },
      data: { paidAt: new Date(), status: 'PAID' },
      include: INVOICE_INCLUDE,
    });
    void this.notifier.notify(paid, company.companyData!.name, 'paid');
    return toInvoiceView(paid);
  }

  /**
   * A unique INV-YYYY-NNNNNN number from the year's invoice count, retrying
   * on the (unlikely) collision with a concurrent invoice.
   */
  private async generateInvoiceNo(): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await this.prisma.companyInvoice.count({
        where: { invoiceNo: { startsWith: `INV-${year}-` } },
      });
      const candidate = `INV-${year}-${String(count + 1 + attempt).padStart(6, '0')}`;
      const exists = await this.prisma.companyInvoice.findUnique({
        where: { invoiceNo: candidate },
      });
      if (!exists) return candidate;
    }
    // Fall back to a random suffix after repeated collisions
    return `INV-${year}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`;
  }
}
