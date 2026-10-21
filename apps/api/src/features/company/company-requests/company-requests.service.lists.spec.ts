import { NotFoundException } from '@nestjs/common';
import {
  CompanyRequestsService,
  statusForProvider,
} from './company-requests.service';
import {
  PrismaMock,
  setupCompanyRequestsService,
  baseClientIdentity,
  baseRequest,
} from './company-requests.service.harness';

// The subscription gate has its own spec; here every company is subscribed
jest.mock(
  'src/features/company-subscriptions/company-subscription.rules',
  () => ({
    ...jest.requireActual<Record<string, unknown>>(
      'src/features/company-subscriptions/company-subscription.rules',
    ),
    assertActiveCompanySubscription: jest.fn().mockResolvedValue(undefined),
    hasActiveCompanySubscription: jest.fn().mockResolvedValue(true),
    grantTrialIfNew: jest.fn().mockResolvedValue(undefined),
  }),
);

describe('CompanyRequestsService: lists, details status, saved and dismissed', () => {
  const harness = setupCompanyRequestsService();
  let service: CompanyRequestsService;
  let prisma: PrismaMock;
  beforeEach(() => {
    ({ service, prisma } = harness);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMine', () => {
    it('scopes to targetIdentityId for the "company" scope', async () => {
      await service.findMine('company-1', { scope: 'company' });

      expect(prisma.companyRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ targetIdentityId: 'company-1' }),
        }),
      );
    });

    it('excludes requests claimed by other companies for the "public" scope', async () => {
      await service.findMine('company-1', { scope: 'public' });

      expect(prisma.companyRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            targetIdentityId: null,
            OR: [
              { acceptedByIdentityId: null },
              { acceptedByIdentityId: 'company-1' },
            ],
          }),
        }),
      );
    });

    it('a company with a specialty sees public requests of that specialty (or none)', async () => {
      prisma.companyIdentityData.findUnique.mockResolvedValue({
        specialty: 'التشطيب',
      });

      await service.findMine('company-1', { scope: 'public' });

      const { where } = (
        prisma.companyRequest.findMany.mock.calls as unknown[][]
      )[0][0] as {
        where: { AND?: unknown[] };
      };
      expect(where.AND).toContainEqual({
        OR: [
          { category: 'التشطيب' },
          { category: null },
          { acceptedByIdentityId: 'company-1' },
        ],
      });
    });

    it('a company without a specialty yet sees every public request', async () => {
      await service.findMine('company-1', { scope: 'public' });

      const { where } = (
        prisma.companyRequest.findMany.mock.calls as unknown[][]
      )[0][0] as {
        where: { AND?: unknown[] };
      };
      // Only the 30-day rule for rejected requests; no specialty filter
      expect(where.AND).toHaveLength(1);
      expect(JSON.stringify(where.AND)).not.toContain('category');
    });

    it('requests sent to the company directly are not narrowed by specialty', async () => {
      prisma.companyIdentityData.findUnique.mockResolvedValue({
        specialty: 'التشطيب',
      });

      await service.findMine('company-1', { scope: 'company' });

      expect(prisma.companyIdentityData.findUnique).not.toHaveBeenCalled();
    });

    it("maps rating as the average of the client's received reviews", async () => {
      const [result] = await service.findMine('company-1', {
        scope: 'company',
      });
      expect(result.client.rating).toBe(4.5);
    });

    it('returns a null rating when the client has no reviews yet', async () => {
      prisma.companyRequest.findMany.mockResolvedValue([
        {
          ...baseRequest,
          clientIdentity: { ...baseClientIdentity, receivedReviews: [] },
        },
      ]);
      const [result] = await service.findMine('company-1', {
        scope: 'company',
      });
      expect(result.client.rating).toBeNull();
    });

    it('scopes to the caller as the submitter for the "mine" scope', async () => {
      await service.findMine('client-1', { scope: 'mine' });

      expect(prisma.companyRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clientIdentityId: 'client-1',
          }),
        }),
      );
    });
  });

  describe('findMine - requester view', () => {
    const provider = {
      id: 'company-1',
      companyData: {
        name: 'شركة أركان',
        logoUrl: 'https://x/logo.png',
        specialty: 'الاستشارات الهندسية',
        services: null,
        isVerified: true,
      },
      officeData: null,
    };

    const offerFrom = (providerRow: any, over: any = {}) => ({
      id: 'offer-1',
      providerIdentityId: providerRow.id,
      provider: providerRow,
      message: 'مرحبا نحن مستعدون',
      notes: 'خلال 24 ساعة',
      price: 150,
      status: 'SENT',
      ...over,
    });

    it('returns the provider it went to (or that accepted it) and its offers', async () => {
      prisma.companyRequest.findMany.mockResolvedValue([
        {
          ...baseRequest,
          status: 'ACCEPTED',
          targetIdentity: provider,
          acceptedByIdentity: provider,
          offers: [offerFrom(provider), offerFrom(provider, { id: 'offer-2' })],
        },
      ]);

      const [result] = await service.findMine('client-1', { scope: 'mine' });

      expect(result.provider).toEqual({
        id: 'company-1',
        name: 'شركة أركان',
        logoUrl: 'https://x/logo.png',
        specialty: 'الاستشارات الهندسية',
        isVerified: true,
      });
      expect(result.offersCount).toBe(2);
      expect(result.offers?.[0]).toEqual({
        id: 'offer-1',
        provider: expect.objectContaining({ name: 'شركة أركان' }),
        price: 150,
        status: 'sent',
        reply: { message: 'مرحبا نحن مستعدون', notes: 'خلال 24 ساعة' },
      });
    });

    it("shows a company only its own offer, never another company's", async () => {
      const other = { ...provider, id: 'company-2' };
      prisma.companyRequest.findMany.mockResolvedValue([
        {
          ...baseRequest,
          targetIdentityId: null,
          offers: [offerFrom(provider), offerFrom(other, { id: 'offer-2' })],
        },
      ]);

      const [asCompany] = await service.findMine('company-2', {
        scope: 'public',
      });
      expect(asCompany.offers?.map((o) => o.id)).toEqual(['offer-2']);

      const [asClient] = await service.findMine('client-1', { scope: 'mine' });
      expect(asClient.offers).toHaveLength(2);
    });

    it('has no provider for an unclaimed public request', async () => {
      prisma.companyRequest.findMany.mockResolvedValue([
        { ...baseRequest, targetIdentityId: null },
      ]);
      const [result] = await service.findMine('client-1', { scope: 'mine' });
      expect(result.provider).toBeNull();
      expect(result.offersCount).toBe(0);
    });

    it('drops rejected requests older than 30 days from the list', async () => {
      await service.findMine('client-1', { scope: 'mine' });

      const where = prisma.companyRequest.findMany.mock.calls[0][0].where;
      expect(where.AND).toContainEqual({
        NOT: {
          status: 'REJECTED',
          updatedAt: { lt: expect.any(Date) },
        },
      });
    });
  });

  describe("تم الرد is the company's own (QA: shown without replying)", () => {
    const offerBy = (providerIdentityId: string) => ({
      id: `offer-${providerIdentityId}`,
      providerIdentityId,
      provider: null,
      price: null,
      status: 'SENT',
      message: 'عرضنا',
      excludes: null,
      notes: null,
      createdAt: new Date('2026-02-02T00:00:00.000Z'),
    });

    it('opening the details of a public request another company answered shows قيد الانتظار', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
        status: 'RESPONDED',
        offers: [offerBy('company-other')],
      });

      const result = await service.findOne('req-1', 'company-1');

      expect(result.status).toBe('pending');
    });

    it('a request marked answered with no reply (an opened chat) shows قيد الانتظار', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        status: 'RESPONDED',
        offers: [],
      });

      expect((await service.findOne('req-1', 'company-1')).status).toBe(
        'pending',
      );
    });

    it('once this company sent its reply, it sees تم الرد', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        status: 'RESPONDED',
        offers: [offerBy('company-1')],
      });

      expect((await service.findOne('req-1', 'company-1')).status).toBe(
        'responded',
      );
    });

    it("the requester still sees the request's own status", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        status: 'RESPONDED',
        offers: [offerBy('company-1')],
      });

      expect((await service.findOne('req-1', 'client-1')).status).toBe(
        'responded',
      );
    });

    it('the lists show each company its own status', async () => {
      prisma.companyRequest.findMany.mockResolvedValue([
        {
          ...baseRequest,
          id: 'a',
          status: 'RESPONDED',
          offers: [offerBy('company-other')],
        },
        {
          ...baseRequest,
          id: 'b',
          status: 'RESPONDED',
          offers: [offerBy('company-1')],
        },
      ]);

      const result = await service.findMine('company-1', { scope: 'public' });

      expect(result.map((r) => [r.id, r.status])).toEqual([
        ['a', 'pending'],
        ['b', 'responded'],
      ]);
    });

    it.each([
      ['pending', { none: { providerIdentityId: 'company-1' } }],
      ['responded', { some: { providerIdentityId: 'company-1' } }],
    ] as const)(
      "the %s tab filters by this company's own reply",
      async (status, offers) => {
        await service.findMine('company-1', { scope: 'public', status });

        const { where } = (
          prisma.companyRequest.findMany.mock.calls as unknown[][]
        )[0][0] as { where: Record<string, unknown> };
        expect(where.status).toEqual({ in: ['PENDING', 'RESPONDED'] });
        expect(where.offers).toEqual(offers);
      },
    );

    it("the requester's own list (mine) keeps filtering by the request status", async () => {
      await service.findMine('client-1', {
        scope: 'mine',
        status: 'responded',
      });

      const { where } = (
        prisma.companyRequest.findMany.mock.calls as unknown[][]
      )[0][0] as { where: Record<string, unknown> };
      expect(where.status).toBe('RESPONDED');
      expect(where.offers).toBeUndefined();
    });

    it('mark-responded (opening a chat) no longer changes the status', async () => {
      await service.markResponded('req-1', 'company-1');

      expect(prisma.companyRequest.updateMany).not.toHaveBeenCalled();
    });

    it('statusForProvider leaves accepted and rejected as they are', () => {
      expect(statusForProvider('ACCEPTED', [], 'company-1')).toBe('accepted');
      expect(statusForProvider('REJECTED', [], 'company-1')).toBe('rejected');
    });
  });

  describe('findForIdentityAsAdmin', () => {
    it('scopes to clientIdentityId for an INDIVIDUAL identity', async () => {
      await service.findForIdentityAsAdmin('client-1', 'INDIVIDUAL');

      expect(prisma.companyRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientIdentityId: 'client-1' },
        }),
      );
    });

    it('scopes to targetIdentityId or acceptedByIdentityId for a COMPANY identity', async () => {
      await service.findForIdentityAsAdmin('company-1', 'COMPANY');

      expect(prisma.companyRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { targetIdentityId: 'company-1' },
              { acceptedByIdentityId: 'company-1' },
            ],
          },
        }),
      );
    });
  });

  describe('public list: dismissed, saved and تصفية البحث', () => {
    const whereOf = () =>
      (
        prisma.companyRequest.findMany.mock.calls as {
          where: Record<string, unknown>;
        }[][]
      )[0][0].where;

    it('leaves out the public requests this company rejected', async () => {
      await service.findMine('company-1', { scope: 'public' });

      expect(whereOf().dismissals).toEqual({
        none: { identityId: 'company-1' },
      });
    });

    it('lists them under مرفوضة, whatever their shared status', async () => {
      await service.findMine('company-1', {
        scope: 'public',
        status: 'rejected',
      });

      const where = whereOf();
      // Only the ones it rejected, for 30 days
      expect(where.dismissals).toEqual({
        some: {
          identityId: 'company-1',
          kind: 'rejected',
          createdAt: { gte: expect.any(Date) },
        },
      });
      expect(where.status).toBeUndefined();
    });

    it('applies the filters and المفضلة', async () => {
      await service.findMine('company-1', {
        scope: 'company',
        specialty: 'التشطيب',
        type: 'تشطيب شقة',
        priceFrom: 1000,
        priceTo: 5000,
        location: 'حولي',
        saved: true,
      });

      expect(whereOf().AND).toEqual(
        expect.arrayContaining([
          { category: 'التشطيب' },
          { title: 'تشطيب شقة' },
          { priceMax: { gte: 1000 } },
          { priceMin: { lte: 5000 } },
          { location: { contains: 'حولي', mode: 'insensitive' } },
          { bookmarks: { some: { identityId: 'company-1' } } },
        ]),
      );
    });
  });

  describe('bookmarks (اضافة الى المفضلة)', () => {
    it('saves a request the company can see', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });

      await expect(service.bookmark('req-1', 'company-1')).resolves.toEqual({
        saved: true,
      });
      expect(prisma.requestBookmark.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: { requestId: 'req-1', identityId: 'company-1' },
        }),
      );
    });

    it("can't save a request it can't see", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-other',
      });

      await expect(service.bookmark('req-1', 'company-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('removes a saved request', async () => {
      await expect(service.unbookmark('req-1', 'company-1')).resolves.toEqual({
        saved: false,
      });
      expect(prisma.requestBookmark.deleteMany).toHaveBeenCalledWith({
        where: { requestId: 'req-1', identityId: 'company-1' },
      });
    });
  });
});
