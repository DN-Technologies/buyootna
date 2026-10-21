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
  mockNotifications,
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

describe('CompanyRequestsService: a company accepts, rejects and responds', () => {
  const harness = setupCompanyRequestsService();
  let service: CompanyRequestsService;
  let prisma: PrismaMock;
  beforeEach(() => {
    ({ service, prisma } = harness);
  });

  describe('accept', () => {
    it('atomically claims a request and returns it as accepted', async () => {
      const result = await service.accept('req-1', 'company-1');

      expect(prisma.companyRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'req-1', status: 'PENDING' },
        data: { status: 'ACCEPTED', acceptedByIdentityId: 'company-1' },
      });
      expect(result).toBeDefined();
    });

    it('throws a conflict when the request was already claimed by another company', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });
      prisma.companyRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.accept('req-1', 'company-2')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws not-found when the request is targeted at a different company', async () => {
      await expect(service.accept('req-1', 'company-99')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reject', () => {
    it('rejects a request targeted directly at this company', async () => {
      await service.reject('req-1', 'company-1');

      expect(prisma.companyRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'REJECTED' },
      });
    });

    it('rejecting a public request hides it for this company only', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });

      await service.reject('req-1', 'company-1');

      expect(prisma.requestDismissal.upsert).toHaveBeenCalledWith({
        where: {
          requestId_identityId: { requestId: 'req-1', identityId: 'company-1' },
        },
        create: {
          requestId: 'req-1',
          identityId: 'company-1',
          kind: 'rejected',
        },
        update: {},
      });
      // The shared status (other companies, the client) is untouched
      expect(prisma.companyRequest.update).not.toHaveBeenCalled();
    });

    it("can't reject a request sent to another company", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-other',
        acceptedByIdentityId: 'company-1',
      });

      await expect(service.reject('req-1', 'company-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getVisibleRequestOrThrow (via findOne)', () => {
    it('throws not-found for a request neither targeted, public, nor accepted by this company', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-other',
        acceptedByIdentityId: null,
      });

      await expect(service.findOne('req-1', 'company-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lets the requester open their own directed request, with its provider and updatedAt', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-9',
        targetIdentity: {
          id: 'company-9',
          companyData: {
            name: 'شركة أركان',
            logoUrl: null,
            specialty: 'هندسي',
            services: null,
            isVerified: true,
          },
          officeData: null,
        },
        offers: [],
      });

      const result = await service.findOne('req-1', 'client-1');

      expect(result.provider?.name).toBe('شركة أركان');
      expect(result.offersCount).toBe(0);
      expect(result.updatedAt).toBe('2026-02-01T00:00:00.000Z');
    });

    it('does not let the requester mark their own request responded', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-9',
      });

      await expect(service.markResponded('req-1', 'client-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('is visible when the request is public', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });

      await expect(
        service.findOne('req-1', 'company-1'),
      ).resolves.toBeDefined();
    });
  });

  describe('respond (a company answers a request)', () => {
    const dto = { message: 'مرحبا', notes: 'خلال يومين', price: 200 };

    it("creates the company's offer and marks a pending request responded", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-1',
      });
      await service.respond('req-1', 'company-1', dto);

      expect(prisma.requestOffer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            requestId_providerIdentityId: {
              requestId: 'req-1',
              providerIdentityId: 'company-1',
            },
          },
          create: expect.objectContaining({
            requestId: 'req-1',
            providerIdentityId: 'company-1',
            message: 'مرحبا',
            notes: 'خلال يومين',
            price: 200,
          }),
        }),
      );
      expect(prisma.companyRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'req-1', status: 'PENDING' },
        data: { status: 'RESPONDED' },
      });
    });

    it("a request sent to another company can't be answered", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-other',
      });
      await expect(service.respond('req-1', 'company-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("a closed request can't be answered", async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
        status: 'ACCEPTED',
      });
      await expect(service.respond('req-1', 'company-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('respond: the reply sheet', () => {
    beforeEach(() => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-1',
      });
    });

    it('accepts notes alone (both fields are optional)', async () => {
      await service.respond('req-1', 'company-1', { notes: 'يشمل المواد' });

      expect(prisma.requestOffer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            message: null,
            notes: 'يشمل المواد',
          }),
        }),
      );
    });

    it('refuses an empty reply', async () => {
      await expect(
        service.respond('req-1', 'company-1', { message: '  ', notes: '' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.requestOffer.upsert).not.toHaveBeenCalled();
    });

    it('notifies the client on their persona', async () => {
      await service.respond('req-1', 'company-1', { message: 'مرحبا' });

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-client',
          type: 'REQUEST_REPLY',
          identityId: 'client-1',
          data: { requestId: 'req-1' },
        }),
      );
    });

    it("a failed notice doesn't fail the reply", async () => {
      mockNotifications.create.mockRejectedValueOnce(new Error('down'));

      await expect(
        service.respond('req-1', 'company-1', { message: 'مرحبا' }),
      ).resolves.toBeDefined();
    });
  });
});
