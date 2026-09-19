import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRequestsService } from './company-requests.service';
import { PrismaService } from '../../core/prisma/prisma.service';

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
};

describe('CompanyRequestsService', () => {
  let service: CompanyRequestsService;
  let prisma: {
    companyRequest: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      companyRequest: {
        findMany: jest.fn().mockResolvedValue([baseRequest]),
        findUnique: jest.fn().mockResolvedValue(baseRequest),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue(baseRequest),
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
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

    it('maps rating as the average of the client\'s received reviews', async () => {
      const [result] = await service.findMine('company-1', { scope: 'company' });
      expect(result.client.rating).toBe(4.5);
    });

    it('returns a null rating when the client has no reviews yet', async () => {
      prisma.companyRequest.findMany.mockResolvedValue([
        { ...baseRequest, clientIdentity: { ...baseClientIdentity, receivedReviews: [] } },
      ]);
      const [result] = await service.findMine('company-1', { scope: 'company' });
      expect(result.client.rating).toBeNull();
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
});
