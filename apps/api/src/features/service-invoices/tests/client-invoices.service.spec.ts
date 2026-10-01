import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ClientInvoicesService } from '../services/client-invoices.service';

// The first call's argument, typed for the assertions below
type QueryArgs = {
  where: Record<string, unknown> & { OR?: unknown[]; identityId?: string };
  orderBy: unknown[];
  data: Record<string, unknown>;
};
const firstArg = (mock: jest.Mock) => (mock.mock.calls as [QueryArgs][])[0][0];

describe('ClientInvoicesService', () => {
  const prisma = {
    companyInvoice: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const service = new ClientInvoicesService(prisma as unknown as PrismaService);
  const mine = { clientIdentityId: 'client-1', clientDeletedAt: null };

  beforeEach(() => jest.clearAllMocks());

  it('lists what was addressed to this persona and not deleted, newest first', async () => {
    await service.list('client-1');

    const args = firstArg(prisma.companyInvoice.findMany);
    expect(args.where).toEqual(mine);
    expect(args.orderBy[0]).toEqual({ issueDate: 'desc' });
  });

  it('searches the invoice number, the service and the company name, oldest first', async () => {
    await service.list('client-1', { search: 'دار', sort: 'oldest' });

    const args = firstArg(prisma.companyInvoice.findMany);
    expect(args.where).toMatchObject(mine);
    expect(args.where.OR).toEqual([
      { invoiceNo: { contains: 'دار', mode: 'insensitive' } },
      { title: { contains: 'دار', mode: 'insensitive' } },
      {
        identity: {
          companyData: { name: { contains: 'دار', mode: 'insensitive' } },
        },
      },
    ]);
    expect(args.orderBy[0]).toEqual({ issueDate: 'asc' });
  });

  it("someone else's invoice is not found", async () => {
    prisma.companyInvoice.findFirst.mockResolvedValue(null);
    await expect(service.get('client-1', 'inv-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.companyInvoice.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inv-1', ...mine } }),
    );
  });

  it('delete only hides it from this client', async () => {
    prisma.companyInvoice.updateMany.mockResolvedValue({ count: 1 });

    await service.remove('client-1', 'inv-1');

    expect(prisma.companyInvoice.updateMany).toHaveBeenCalledWith({
      where: { id: 'inv-1', ...mine },
      data: { clientDeletedAt: expect.any(Date) as Date },
    });
  });

  it("deleting someone else's invoice is not found", async () => {
    prisma.companyInvoice.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.remove('client-1', 'inv-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
