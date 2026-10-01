import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CompanyInvoicesService } from '../services/company-invoices.service';
import { InvoiceNotifierService } from '../services/invoice-notifier.service';

// The first call's argument, typed for the assertions below
type QueryArgs = {
  where: Record<string, unknown> & { OR?: unknown[]; identityId?: string };
  orderBy: unknown[];
  data: Record<string, unknown>;
};
const firstArg = (mock: jest.Mock) => (mock.mock.calls as [QueryArgs][])[0][0];

describe('CompanyInvoicesService', () => {
  const company = {
    id: 'co-1',
    type: 'COMPANY',
    companyData: { name: 'دار العقار الحديث', status: 'APPROVED' },
  };
  const prisma = {
    identity: { findUnique: jest.fn() },
    companyRequest: { findUnique: jest.fn(), findMany: jest.fn() },
    companyInvoice: {
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
  };
  const notifier = { notify: jest.fn() };
  const service = new CompanyInvoicesService(
    prisma as unknown as PrismaService,
    notifier as unknown as InvoiceNotifierService,
  );

  const stored = (data: Record<string, unknown>) => ({
    id: 'inv-1',
    invoiceNo: 'INV-2026-000001',
    clientIdentityId: null,
    paidAt: null,
    createdAt: new Date(),
    items: [],
    identity: {
      companyData: {
        name: 'دار العقار الحديث',
        logoUrl: null,
        specialty: null,
      },
    },
    ...data,
  });

  const dto = {
    title: 'ادوات للتشطيب',
    issueDate: '2026-07-05T09:30:00.000Z',
    items: [
      { name: 'دهانات', price: 1300, qty: 1 },
      { name: 'دهانات', price: 100, qty: 2 },
    ],
    discount: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // companyOf() and assertApprovedProvider() both read the identity
    prisma.identity.findUnique.mockResolvedValue(company);
    prisma.companyInvoice.create.mockImplementation(({ data }) =>
      stored(data as Record<string, unknown>),
    );
  });

  it('links the invoice to the client of an accepted request, and notifies them', async () => {
    prisma.companyRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      status: 'ACCEPTED',
      acceptedByIdentityId: 'co-1',
      clientIdentityId: 'client-1',
      clientIdentity: {
        individualData: { name: 'سالم' },
        companyData: null,
        officeData: null,
        user: { name: null },
      },
    });

    const result = await service.create('co-1', { ...dto, requestId: 'req-1' });

    const { data } = firstArg(prisma.companyInvoice.create);
    expect(data).toMatchObject({
      identityId: 'co-1',
      clientIdentityId: 'client-1',
      requestId: 'req-1',
      clientName: 'سالم',
      // Server-side totals: 1300 + 200, minus 100
      subtotal: 1500,
      discount: 100,
      total: 1400,
    });
    expect(result.invoice.linkedToClient).toBe(true);
    expect(notifier.notify).toHaveBeenCalledWith(
      expect.objectContaining({ clientIdentityId: 'client-1' }),
      'دار العقار الحديث',
      'issued',
    );
  });

  it.each([
    ['still pending', { status: 'PENDING', acceptedByIdentityId: null }],
    [
      'accepted by another company',
      { status: 'ACCEPTED', acceptedByIdentityId: 'co-2' },
    ],
  ])('refuses a request %s', async (_, request) => {
    prisma.companyRequest.findUnique.mockResolvedValue({
      id: 'req-1',
      clientIdentityId: 'client-1',
      ...request,
    });

    await expect(
      service.create('co-1', { ...dto, requestId: 'req-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.companyInvoice.create).not.toHaveBeenCalled();
  });

  it('a typed client name reaches no account', async () => {
    const result = await service.create('co-1', {
      ...dto,
      clientName: 'عميل خارجي',
    });

    expect(firstArg(prisma.companyInvoice.create).data).toMatchObject({
      clientName: 'عميل خارجي',
      clientIdentityId: null,
    });
    expect(result.invoice.linkedToClient).toBe(false);
  });

  it('without a request, a client name is required', async () => {
    await expect(service.create('co-1', dto)).rejects.toThrow(
      'اسم العميل مطلوب',
    );
    expect(prisma.companyInvoice.create).not.toHaveBeenCalled();
  });

  it('only a company persona can issue', async () => {
    prisma.identity.findUnique.mockResolvedValue({
      id: 'ind-1',
      type: 'INDIVIDUAL',
    });
    await expect(service.create('ind-1', dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists only its own invoices', async () => {
    await service.list('co-1', { search: 'INV', sort: 'oldest' });

    const args = firstArg(prisma.companyInvoice.findMany);
    expect(args.where.identityId).toBe('co-1');
    expect(args.orderBy[0]).toEqual({ issueDate: 'asc' });
  });

  it('offers its accepted requests as clients to invoice', async () => {
    prisma.companyRequest.findMany.mockResolvedValue([
      {
        id: 'req-1',
        title: 'تشطيب محل تجاري',
        updatedAt: new Date(),
        clientIdentity: {
          individualData: { name: 'سالم' },
          companyData: null,
          officeData: null,
          user: { name: null },
        },
      },
    ]);

    const result = await service.invoiceableRequests('co-1');

    expect(firstArg(prisma.companyRequest.findMany).where).toEqual({
      acceptedByIdentityId: 'co-1',
      status: 'ACCEPTED',
    });
    expect(result).toEqual([
      expect.objectContaining({ requestId: 'req-1', clientName: 'سالم' }),
    ]);
  });

  describe('markPaid', () => {
    it('stamps paidAt once and notifies the client', async () => {
      prisma.companyInvoice.findFirst.mockResolvedValue(
        stored({ clientIdentityId: 'client-1' }),
      );
      prisma.companyInvoice.update.mockResolvedValue(
        stored({ clientIdentityId: 'client-1', paidAt: new Date() }),
      );

      const result = await service.markPaid('co-1', 'inv-1');

      expect(prisma.companyInvoice.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'inv-1', identityId: 'co-1' } }),
      );
      expect(result.paidAt).toBeInstanceOf(Date);
      expect(notifier.notify).toHaveBeenCalledWith(
        expect.anything(),
        'دار العقار الحديث',
        'paid',
      );
    });

    it('an already-paid invoice is left as it is', async () => {
      prisma.companyInvoice.findFirst.mockResolvedValue(
        stored({ paidAt: new Date() }),
      );

      await service.markPaid('co-1', 'inv-1');

      expect(prisma.companyInvoice.update).not.toHaveBeenCalled();
      expect(notifier.notify).not.toHaveBeenCalled();
    });

    it("another company's invoice is not found", async () => {
      prisma.companyInvoice.findFirst.mockResolvedValue(null);
      await expect(service.markPaid('co-1', 'inv-x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
