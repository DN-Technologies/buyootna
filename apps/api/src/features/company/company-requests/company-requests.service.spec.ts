import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRequestsService } from './company-requests.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

const baseClientIdentity = {
  id: 'client-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  user: { phone: '+96590000000', whatsapp: '+96590000000' },
  individualData: { name: 'نواف الجارحي', avatarUrl: 'https://x/a.jpg' },
  officeData: null,
  companyData: null,
  receivedReviews: [{ rating: 4 }, { rating: 5 }],
};

const baseRequest = {
  id: 'req-1',
  clientIdentityId: 'client-1',
  targetIdentityId: 'company-1',
  acceptedByIdentityId: null,
  title: 'تشطيب محل',
  category: 'تشطيب',
  priceRange: null,
  location: 'السالمية',
  latitude: null,
  longitude: null,
  offerType: null,
  images: [],
  description: 'وصف الطلب',
  status: 'PENDING',
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  clientIdentity: baseClientIdentity,
  targetIdentity: null,
  acceptedByIdentity: null,
  offers: [],
};

describe('CompanyRequestsService', () => {
  let service: CompanyRequestsService;
  let prisma: {
    companyRequest: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
      deleteMany: jest.Mock;
    };
    requestOffer: {
      upsert: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
    identity: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      companyRequest: {
        findMany: jest.fn().mockResolvedValue([baseRequest]),
        findUnique: jest.fn().mockResolvedValue(baseRequest),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue(baseRequest),
        create: jest.fn().mockResolvedValue(baseRequest),
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      requestOffer: {
        upsert: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
      // The caller/target: an approved company unless a test says otherwise
      identity: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'company-1',
          type: 'COMPANY',
          companyData: { status: 'APPROVED' },
          officeData: null,
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRequestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompanyRequestsService>(CompanyRequestsService);
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

  describe('create', () => {
    const dto = {
      title: 'تشطيب',
      category: 'تشطيب',
      location: 'السالمية',
      latitude: 29.33,
      longitude: 48.05,
      priceRange: '100 - 300 د.ك',
      offerType: 'عرض مخصص',
      description: 'أحتاج تشطيب كامل',
      images: ['https://x/1.jpg'],
    };

    it('creates a directed request as the caller with PENDING status', async () => {
      const result = await service.create('client-1', {
        ...dto,
        targetIdentityId: 'company-1',
      });

      expect(prisma.companyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientIdentityId: 'client-1',
            targetIdentityId: 'company-1',
            status: 'PENDING',
            images: ['https://x/1.jpg'],
          }),
        }),
      );
      expect(result.id).toBe('req-1');
    });

    it('creates a public request when no target identity is given', async () => {
      prisma.companyRequest.create.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });

      const result = await service.create('client-1', { ...dto });

      expect(prisma.identity.findUnique).not.toHaveBeenCalled();
      expect(prisma.companyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientIdentityId: 'client-1',
            targetIdentityId: null,
          }),
        }),
      );
      expect(result.scope).toBe('public');
    });

    it('stores the address details from the location picker', async () => {
      prisma.companyRequest.create.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
        addressDetails: { block: '6', building: '12' },
      });

      const result = await service.create('client-1', {
        ...dto,
        addressDetails: { block: '6', street: '', building: '12' },
      });

      expect(prisma.companyRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            addressDetails: { block: '6', building: '12' },
          }),
        }),
      );
      expect(result.addressDetails).toEqual({ block: '6', building: '12' });
    });

    it('rejects a request directed at a missing or non-company target', async () => {
      prisma.identity.findUnique.mockResolvedValue(null);

      await expect(
        service.create('client-1', { ...dto, targetIdentityId: 'ghost' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });

    it('rejects sending a request to yourself', async () => {
      prisma.identity.findUnique.mockResolvedValue({
        id: 'client-1',
        type: 'INDIVIDUAL',
      });

      await expect(
        service.create('client-1', { ...dto, targetIdentityId: 'client-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });
  });

  describe('companies/offices under review', () => {
    const pendingOffice = {
      id: 'office-1',
      type: 'OFFICE',
      companyData: null,
      officeData: { status: 'PENDING' },
    };

    it('cannot be sent a request', async () => {
      prisma.identity.findUnique.mockResolvedValue(pendingOffice);

      await expect(
        service.create('client-1', {
          title: 't',
          category: 'c',
          location: 'l',
          description: 'd',
          targetIdentityId: 'office-1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.companyRequest.create).not.toHaveBeenCalled();
    });

    it('see no leads, but still see their own submissions', async () => {
      prisma.identity.findUnique.mockResolvedValue(pendingOffice);

      await expect(
        service.findMine('office-1', { scope: 'company' }),
      ).resolves.toEqual([]);
      await expect(
        service.findMine('office-1', { scope: 'public' }),
      ).resolves.toEqual([]);
      expect(prisma.companyRequest.findMany).not.toHaveBeenCalled();

      await service.findMine('office-1', { scope: 'mine' });
      expect(prisma.companyRequest.findMany).toHaveBeenCalled();
    });

    it('cannot accept a request', async () => {
      prisma.identity.findUnique.mockResolvedValue(pendingOffice);

      await expect(service.accept('req-1', 'office-1')).rejects.toThrow(
        'حسابك قيد المراجعة',
      );
      expect(prisma.companyRequest.updateMany).not.toHaveBeenCalled();
    });
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

    it('forbids rejecting a public (untargeted) request', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: null,
      });

      await expect(service.reject('req-1', 'company-1')).rejects.toThrow(
        ForbiddenException,
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

  describe('requester actions', () => {
    it('removeMine deletes only the requester\'s own request', async () => {
      await expect(service.removeMine('req-1', 'client-1')).resolves.toEqual({
        deleted: true,
      });
      expect(prisma.companyRequest.deleteMany).toHaveBeenCalledWith({
        where: { id: 'req-1', clientIdentityId: 'client-1' },
      });
    });

    it('removeMine is not-found for someone else\'s request', async () => {
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

  describe('respond (a company answers a request)', () => {
    const dto = { message: 'مرحبا', notes: 'خلال يومين', price: 200 };

    it('creates the company\'s offer and marks a pending request responded', async () => {
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

    it('a request sent to another company can\'t be answered', async () => {
      prisma.companyRequest.findUnique.mockResolvedValue({
        ...baseRequest,
        targetIdentityId: 'company-other',
      });
      await expect(service.respond('req-1', 'company-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('a closed request can\'t be answered', async () => {
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
});
