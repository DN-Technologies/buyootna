import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IdentityStatsService } from '../../../../core/trust-signals/identity-stats.service';
import { ProviderCardsService } from '../provider-cards.service';

describe('ProviderCardsService', () => {
  const prisma = {
    property: {
      groupBy: jest.fn().mockResolvedValue([
        {
          identityId: 'c1',
          _count: { _all: 12 },
          _max: { createdAt: new Date('2026-09-20T10:00:00Z') },
        },
      ]),
    },
    companyService: { groupBy: jest.fn().mockResolvedValue([]) },
  };
  // Ratings are keyed by the persona (identity), not the account
  const identityStats = {
    getStats: jest
      .fn()
      .mockResolvedValue(new Map([['c1', { rating: 4.3, reviewsCount: 9 }]])),
  };
  const service = new ProviderCardsService(
    prisma as unknown as PrismaService,
    identityStats as unknown as IdentityStatsService,
  );

  it('builds company cards with rating, reviews, projects and last activity', async () => {
    const cards = await service.formatCompanyCards([
      {
        id: 'c1',
        userId: 'u1',
        companyData: {
          name: 'مؤسسة النخبة',
          services: 'تشطيب',
          serviceAreas: ['العاصمة'],
          logoUrl: 'logo.png',
          isVerified: true,
          updatedAt: new Date('2026-01-01'),
        },
      } as never,
    ]);

    expect(cards).toEqual([
      {
        id: 'c1',
        userId: 'u1',
        name: 'مؤسسة النخبة',
        category: 'تشطيب',
        rating: 4.3,
        reviewsCount: 9,
        projectsCount: '12',
        // No service rows: counted from the free-text list
        servicesCount: 1,
        serviceArea: ['العاصمة'],
        logoUrl: 'logo.png',
        isVerified: true,
        lastActivityAt: '2026-09-20T10:00:00.000Z',
      },
    ]);
  });

  it("counts a company's visible service rows when it has them", async () => {
    prisma.companyService.groupBy.mockResolvedValueOnce([
      { identityId: 'c1', _count: { _all: 5 } },
    ]);

    const [card] = await service.formatCompanyCards([
      {
        id: 'c1',
        userId: 'u1',
        companyData: {
          name: 'مؤسسة النخبة',
          services: 'تشطيب',
          serviceAreas: [],
          logoUrl: null,
          isVerified: true,
          updatedAt: new Date('2026-01-01'),
        },
      } as never,
    ]);

    expect(card.servicesCount).toBe(5);
    expect(prisma.companyService.groupBy).toHaveBeenLastCalledWith({
      by: ['identityId'],
      where: { identityId: { in: ['c1'] }, isHidden: false },
      _count: { _all: true },
    });
  });

  it("counts an office's live ads per type and its services", async () => {
    prisma.property.groupBy.mockResolvedValueOnce([
      { identityId: 'o1', type: 'SALE', _count: { _all: 30 } },
      { identityId: 'o1', type: 'RENT', _count: { _all: 7 } },
      { identityId: 'o2', type: 'RENT', _count: { _all: 4 } },
    ]);

    const [card] = await service.formatOfficeCards([
      {
        id: 'o1',
        userId: 'u9',
        officeData: {
          name: 'الوطن للعقارات',
          services: 'عقار للايجار، تبادل عقاري',
          hqLocation: 'السالمية',
          logoUrl: null,
          isVerified: true,
        },
        user: { phone: null, whatsapp: null },
      } as never,
    ]);

    expect(card).toMatchObject({
      propertiesCount: 37,
      listingTypes: ['SALE', 'RENT'],
      servicesCount: 2,
    });
  });

  it('builds office cards with contact details', async () => {
    const cards = await service.formatOfficeCards([
      {
        id: 'o1',
        userId: 'u9',
        officeData: {
          name: 'الوطن للعقارات',
          hqLocation: 'السالمية',
          logoUrl: null,
          isVerified: false,
        },
        user: { phone: '+96599990000', whatsapp: null },
      } as never,
    ]);

    expect(cards[0]).toMatchObject({
      id: 'o1',
      name: 'الوطن للعقارات',
      rating: 0,
      reviewsCount: 0,
      location: 'السالمية',
      phone: '+96599990000',
      // Offices have no WhatsApp: phone or in-app chat only
      whatsapp: null,
    });
  });
});
