import { AdminBillingListService } from './admin-billing-list.service';

const identity = (type: string, name: string) => ({
  id: `${type}-id`,
  type,
  userId: 'user-1',
  user: { email: 'owner@example.com', phone: null },
  individualData: type === 'INDIVIDUAL' ? { name } : null,
  companyData: type === 'COMPANY' ? { name } : null,
  officeData: type === 'OFFICE' ? { name } : null,
});

function setup() {
  const prisma = {
    companySubscription: { findMany: jest.fn(), count: jest.fn() },
    userPlanSlot: { findMany: jest.fn(), count: jest.fn() },
    invoice: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    plan: { findMany: jest.fn().mockResolvedValue([{ name: 'الذهبية' }]) },
    companyPlan: {
      findMany: jest.fn().mockResolvedValue([{ name: 'السنوية' }]),
    },
  };
  const service = new AdminBillingListService(prisma as never);
  return { prisma, service };
}

describe('AdminBillingListService', () => {
  describe('getSubscriptions', () => {
    it("lists companies' periods and ad credits together, newest first", async () => {
      const { prisma, service } = setup();
      const future = new Date(Date.now() + 30 * 86_400_000);
      prisma.companySubscription.findMany.mockResolvedValue([
        {
          id: 'period-1',
          kind: 'PAID',
          identity: identity('COMPANY', 'الصباح'),
          companyPlan: { name: 'السنوية', price: 300 },
          invoice: { id: 'inv-1', invoiceNo: 'INV-1', amount: 300 },
          startsAt: new Date('2026-10-01'),
          endsAt: future,
          createdAt: new Date('2026-10-01'),
        },
      ]);
      prisma.userPlanSlot.findMany.mockResolvedValue([
        {
          id: 'slot-1',
          identity: identity('INDIVIDUAL', 'سارة'),
          plan: { name: 'الذهبية' },
          invoice: null,
          status: 'ACTIVE',
          adsRemaining: 0,
          createdAt: new Date('2026-10-05'),
        },
      ]);
      prisma.companySubscription.count.mockResolvedValue(1);
      prisma.userPlanSlot.count.mockResolvedValue(1);

      const result = await service.getSubscriptions({ page: 1, limit: 10 });

      expect(result.data.map((r) => r.id)).toEqual(['slot-1', 'period-1']);
      expect(result.data[0]).toMatchObject({
        kind: 'AD_CREDITS',
        name: 'سارة',
        planName: 'الذهبية',
        amount: null, // granted by an admin
        status: 'expired', // no ads left
        endsAt: null,
      });
      expect(result.data[1]).toMatchObject({
        kind: 'COMPANY_PERIOD',
        name: 'الصباح',
        amount: 300,
        status: 'active',
        invoice: { id: 'inv-1', invoiceNo: 'INV-1' },
      });
      expect(result.meta.total).toBe(2);
      expect(result.planNames).toEqual([
        'الذهبية',
        'السنوية',
        'الفترة التجريبية',
      ]);
    });

    it("doesn't look at company periods when filtering individuals", async () => {
      const { prisma, service } = setup();
      prisma.userPlanSlot.findMany.mockResolvedValue([]);
      prisma.userPlanSlot.count.mockResolvedValue(0);
      prisma.companySubscription.count.mockResolvedValue(0);

      await service.getSubscriptions({
        role: 'INDIVIDUAL',
        page: 1,
        limit: 10,
      });

      expect(prisma.companySubscription.findMany).not.toHaveBeenCalled();
      expect(prisma.userPlanSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ identity: { type: 'INDIVIDUAL' } }),
          take: 10,
        }),
      );
    });
  });

  describe('getInvoices', () => {
    it('lists invoices with their owner and the totals', async () => {
      const { prisma, service } = setup();
      prisma.invoice.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          invoiceNo: 'INV-1',
          identity: identity('OFFICE', 'مكتبي'),
          planName: 'الذهبية',
          companyPlanId: null,
          featurePackageId: null,
          amount: 45,
          status: 'PAID',
          createdAt: new Date('2026-10-01'),
          paidAt: new Date('2026-10-01'),
        },
      ]);
      prisma.invoice.count.mockResolvedValue(1);
      prisma.invoice.groupBy.mockResolvedValue([
        { status: 'PAID', _count: { _all: 3 } },
        { status: 'PENDING', _count: { _all: 1 } },
        { status: 'OVERDUE', _count: { _all: 1 } },
      ]);
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 135 } });

      const result = await service.getInvoices({
        status: 'PAID',
        page: 1,
        limit: 10,
      });

      expect(result.data[0]).toMatchObject({
        invoiceNo: 'INV-1',
        name: 'مكتبي',
        identityType: 'OFFICE',
        kind: 'AD_PLAN',
        amount: 45,
      });
      expect(result.metrics).toEqual({
        total: 5,
        paid: 3,
        pending: 2,
        cancelled: 0,
        revenuePaid: 135,
      });
    });
  });
});
