import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/prisma/prisma.service';
import { OfficesService, startOfKuwaitDay } from './offices.service';

// 2026-10-29 01:30 in Kuwait (UTC+3)
const NOW = new Date('2026-10-28T22:30:00.000Z');

describe('OfficesService', () => {
  let service: OfficesService;
  let prisma: {
    identity: { findUnique: jest.Mock };
    property: { count: jest.Mock; aggregate: jest.Mock; findMany: jest.Mock };
    message: { count: jest.Mock };
    userPlanSlot: { findMany: jest.Mock };
    companyRequest: { findMany: jest.Mock };
    favorite: { groupBy: jest.Mock };
    conversation: { groupBy: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      identity: {
        findUnique: jest.fn().mockResolvedValue({
          freeAdsRemaining: 1,
          officeData: { name: 'الفيروز', services: null },
        }),
      },
      property: {
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({ _sum: { views: null } }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      message: { count: jest.fn().mockResolvedValue(0) },
      userPlanSlot: { findMany: jest.fn().mockResolvedValue([]) },
      companyRequest: { findMany: jest.fn().mockResolvedValue([]) },
      favorite: { groupBy: jest.fn().mockResolvedValue([]) },
      conversation: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OfficesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(OfficesService);
  });

  it('refuses personas that are not offices', async () => {
    await expect(
      service.getDashboard('identity-1', 'COMPANY', NOW),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.property.count).not.toHaveBeenCalled();
  });

  it('starts "today" at midnight Kuwait time', () => {
    expect(startOfKuwaitDay(NOW).toISOString()).toBe(
      '2026-10-28T21:00:00.000Z',
    );
  });

  it('returns zeros and the free ad for a brand-new office', async () => {
    const result = await service.getDashboard('office-1', 'OFFICE', NOW);

    expect(result).toEqual({
      stats: {
        activeListings: 0,
        activeListingsThisWeek: 0,
        activeServices: 0,
        newMessagesToday: 0,
        totalViews: 0,
      },
      billing: {
        hasActivePackage: false,
        adsRemaining: 0,
        freeAdsRemaining: 1,
      },
      listings: [],
      services: [],
    });
    // No ads, no per-ad count queries
    expect(prisma.favorite.groupBy).not.toHaveBeenCalled();
    expect(prisma.conversation.groupBy).not.toHaveBeenCalled();
  });

  it('counts this week, today and lifetime views with the right windows', async () => {
    prisma.property.count
      .mockResolvedValueOnce(5) // active
      .mockResolvedValueOnce(3); // published this week
    prisma.property.aggregate.mockResolvedValue({ _sum: { views: 712 } });
    prisma.message.count.mockResolvedValue(4);

    const { stats } = await service.getDashboard('office-1', 'OFFICE', NOW);

    expect(stats).toMatchObject({
      activeListings: 5,
      activeListingsThisWeek: 3,
      newMessagesToday: 4,
      totalViews: 712,
    });
    expect(prisma.property.count).toHaveBeenNthCalledWith(2, {
      where: {
        identityId: 'office-1',
        status: 'ACTIVE',
        publishedAt: { gte: new Date('2026-10-21T22:30:00.000Z') },
      },
    });
    expect(prisma.message.count).toHaveBeenCalledWith({
      where: {
        createdAt: { gte: new Date('2026-10-28T21:00:00.000Z') },
        senderIdentityId: { not: 'office-1' },
        conversation: { participants: { some: { identityId: 'office-1' } } },
      },
    });
  });

  it('sums credits across active packages', async () => {
    prisma.userPlanSlot.findMany.mockResolvedValue([
      { adsRemaining: 3 },
      { adsRemaining: 2 },
    ]);

    const { billing } = await service.getDashboard('office-1', 'OFFICE', NOW);

    expect(billing).toEqual({
      hasActivePackage: true,
      adsRemaining: 5,
      freeAdsRemaining: 1,
    });
  });

  it('attaches favorite and chat counts to each ad in one batch', async () => {
    prisma.property.findMany.mockResolvedValue([
      {
        id: 'p1',
        type: 'SALE',
        category: 'APARTMENT',
        price: 150000,
        images: ['a.jpg'],
        isFeatured: true,
        featuredUntil: new Date('2026-11-05T00:00:00.000Z'),
        views: 100,
      },
      {
        id: 'p2',
        type: 'EXCHANGE',
        category: 'HOUSE',
        price: null,
        images: [],
        isFeatured: true,
        // Lapsed: no longer shown as featured
        featuredUntil: new Date('2026-10-01T00:00:00.000Z'),
        views: 7,
      },
    ]);
    prisma.favorite.groupBy.mockResolvedValue([
      { propertyId: 'p1', _count: { _all: 20 } },
    ]);
    prisma.conversation.groupBy.mockResolvedValue([
      { propertyId: 'p1', _count: { _all: 3 } },
      { propertyId: 'p2', _count: { _all: 1 } },
    ]);

    const { listings } = await service.getDashboard('office-1', 'OFFICE', NOW);

    expect(prisma.favorite.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.favorite.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { propertyId: { in: ['p1', 'p2'] } } }),
    );
    expect(
      listings.map((l) => [l.id, l.isFeatured, l.favoritesCount, l.chatsCount]),
    ).toEqual([
      ['p1', true, 20, 3],
      ['p2', false, 0, 1],
    ]);
    expect(listings[1].price).toBeNull();
  });

  it('builds services from the profile and counts the open requests that mention each', async () => {
    prisma.identity.findUnique.mockResolvedValue({
      freeAdsRemaining: 0,
      officeData: { name: 'الفيروز', services: 'عقار للايجار، تبادل عقاري' },
    });
    prisma.companyRequest.findMany.mockResolvedValue([
      { category: 'عقار للايجار', title: 'شقة في السالمية' },
      { category: null, title: 'أبحث عن عقار للايجار' },
      { category: 'تبادل عقاري', title: 'بدل بيت' },
      { category: 'تصميم داخلي', title: 'ديكور' },
    ]);

    const result = await service.getDashboard('office-1', 'OFFICE', NOW);

    expect(result.services).toEqual([
      { title: 'عقار للايجار', openRequests: 2 },
      { title: 'تبادل عقاري', openRequests: 1 },
    ]);
    expect(result.stats.activeServices).toBe(2);
    expect(prisma.companyRequest.findMany).toHaveBeenCalledWith({
      where: {
        targetIdentityId: 'office-1',
        status: { in: ['PENDING', 'RESPONDED'] },
      },
      select: { category: true, title: true },
    });
  });
});
