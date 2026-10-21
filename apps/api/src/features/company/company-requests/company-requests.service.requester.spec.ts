import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { CompanyRequestsService } from './company-requests.service';
import {
  PrismaMock,
  setupCompanyRequestsService,
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

describe('CompanyRequestsService: requester actions and finished requests', () => {
  const harness = setupCompanyRequestsService();
  let service: CompanyRequestsService;
  let prisma: PrismaMock;
  beforeEach(() => {
    ({ service, prisma } = harness);
  });

  describe('requester actions', () => {
    it("removeMine deletes only the requester's own request", async () => {
      await expect(service.removeMine('req-1', 'client-1')).resolves.toEqual({
        deleted: true,
      });
      expect(prisma.companyRequest.deleteMany).toHaveBeenCalledWith({
        where: { id: 'req-1', clientIdentityId: 'client-1' },
      });
    });

    it("removeMine is not-found for someone else's request", async () => {
      prisma.companyRequest.deleteMany.mockResolvedValue({ count: 0 });
      await expect(service.removeMine('req-1', 'intruder')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('removeAllMine deletes every request of the requester and counts them', async () => {
      prisma.companyRequest.deleteMany.mockResolvedValue({ count: 4 });
      await expect(service.removeAllMine('client-1')).resolves.toEqual({
        deleted: 4,
      });
      expect(prisma.companyRequest.deleteMany).toHaveBeenCalledWith({
        where: { clientIdentityId: 'client-1' },
      });
    });

    const responded = {
      ...baseRequest,
      status: 'RESPONDED',
      targetIdentityId: 'company-9',
    };

    it('acceptOffer: responded -> accepted by the company it was sent to', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue(responded);
      await service.acceptOffer('req-1', 'client-1');
      expect(prisma.companyRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'ACCEPTED', acceptedByIdentityId: 'company-9' },
      });
    });

    const offers = [
      { id: 'o1', providerIdentityId: 'company-1', status: 'SENT' },
      { id: 'o2', providerIdentityId: 'company-2', status: 'SENT' },
    ];

    it('acceptOffer with offers: accepts that company, rejects the other offers', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...responded,
        offers,
      });
      await service.acceptOffer('req-1', 'client-1', 'o2');

      expect(prisma.requestOffer.update).toHaveBeenCalledWith({
        where: { id: 'o2' },
        data: { status: 'ACCEPTED' },
      });
      expect(prisma.requestOffer.updateMany).toHaveBeenCalledWith({
        where: { requestId: 'req-1', NOT: { id: 'o2' } },
        data: { status: 'REJECTED' },
      });
      expect(prisma.companyRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'ACCEPTED', acceptedByIdentityId: 'company-2' },
      });
    });

    it('with several offers the requester has to say which one', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...responded,
        offers,
      });
      await expect(service.acceptOffer('req-1', 'client-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.rejectOffer('req-1', 'client-1', 'nope'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejectOffer keeps the request open while another offer is waiting', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...responded,
        offers,
      });
      prisma.requestOffer.count.mockResolvedValue(1);
      await service.rejectOffer('req-1', 'client-1', 'o1');

      expect(prisma.requestOffer.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: { status: 'REJECTED' },
      });
      expect(prisma.companyRequest.update).not.toHaveBeenCalled();
    });

    it('rejectOffer rejects the request once no offer is waiting', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...responded,
        offers: [offers[0]],
      });
      prisma.requestOffer.count.mockResolvedValue(0);
      await service.rejectOffer('req-1', 'client-1');

      expect(prisma.companyRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'REJECTED' },
      });
    });

    it('acceptOffer needs a company to accept', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...responded,
        targetIdentityId: null,
      });
      await expect(service.acceptOffer('req-1', 'client-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('rejectOffer: responded -> rejected', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue(responded);
      await service.rejectOffer('req-1', 'client-1');
      expect(prisma.companyRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'REJECTED' },
      });
    });

    it('only the requester can accept or reject, and only a responded request', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue(responded);
      await expect(service.acceptOffer('req-1', 'intruder')).rejects.toThrow(
        NotFoundException,
      );

      prisma.companyRequest.findUnique.mockResolvedValue({
        ...responded,
        status: 'PENDING',
      });
      await expect(service.rejectOffer('req-1', 'client-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('by status: remove, انهاء الطلب, تفاصيل الرد', () => {
    const whereOf = () =>
      (
        prisma.companyRequest.findMany.mock.calls as {
          where: Record<string, unknown>;
        }[][]
      )[0][0].where;

    it('a reply may carry only «العرض لا يشمل»', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-1',
      });
      await service.respond('req-1', 'company-1', { excludes: 'المواد' });

      expect(prisma.requestOffer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            message: null,
            excludes: 'المواد',
            notes: null,
          }),
        }),
      );
    });

    it("the trash takes a request off this company's lists", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-1',
        status: 'ACCEPTED',
        acceptedByIdentityId: 'company-1',
      });

      await expect(
        service.removeFromMine('req-1', 'company-1'),
      ).resolves.toEqual({ removed: true });
      expect(prisma.requestDismissal.upsert).toHaveBeenCalledWith({
        where: {
          requestId_identityId: { requestId: 'req-1', identityId: 'company-1' },
        },
        create: {
          requestId: 'req-1',
          identityId: 'company-1',
          kind: 'removed',
        },
        update: { kind: 'removed' },
      });
    });

    it('the company lists leave out what it took off them', async () => {
      await service.findMine('company-1', { scope: 'company' });
      expect(whereOf().dismissals).toEqual({
        none: { identityId: 'company-1' },
      });
    });

    it('مقبولة leaves out finished requests', async () => {
      await service.findMine('company-1', {
        scope: 'company',
        status: 'accepted',
      });
      expect(whereOf().completedAt).toBeNull();
    });

    it('rejected requests drop off after 30 days', async () => {
      await service.findMine('company-1', { scope: 'company' });
      expect(whereOf().AND).toEqual(
        expect.arrayContaining([
          {
            NOT: {
              status: 'REJECTED',
              updatedAt: { lt: expect.any(Date) },
            },
          },
        ]),
      );
    });

    it('the accepting company ends the request', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        status: 'ACCEPTED',
        acceptedByIdentityId: 'company-1',
      });
      prisma.companyRequest.updateMany.mockResolvedValue({ count: 1 });

      await service.complete('req-1', 'company-1', 'outside');

      expect(prisma.companyRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'req-1', status: 'ACCEPTED', completedAt: null },
        data: { completedAt: expect.any(Date), completedVia: 'outside' },
      });
    });

    it("another company can't end it", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
        status: 'ACCEPTED',
        acceptedByIdentityId: 'company-other',
      });
      await expect(
        service.complete('req-1', 'company-1', 'in_app'),
      ).rejects.toThrow(NotFoundException);
    });

    it('a request not accepted, or already ended, is 409', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        status: 'ACCEPTED',
        acceptedByIdentityId: 'company-1',
      });
      prisma.companyRequest.updateMany.mockResolvedValue({ count: 0 });
      await expect(
        service.complete('req-1', 'company-1', 'in_app'),
      ).rejects.toThrow(ConflictException);
    });

    it('returns completed and completedVia', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        status: 'ACCEPTED',
        acceptedByIdentityId: 'company-1',
        completedAt: new Date(),
        completedVia: 'in_app',
      });
      const result = await service.findOne('req-1', 'company-1');
      expect(result.completed).toBe(true);
      expect(result.completedVia).toBe('in_app');
    });
  });
});
