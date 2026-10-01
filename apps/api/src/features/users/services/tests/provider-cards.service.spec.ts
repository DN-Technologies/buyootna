import { PrismaService } from '../../../../core/prisma/prisma.service';
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
    review: {
      groupBy: jest
        .fn()
        .mockResolvedValue([
          { targetUserId: 'u1', _avg: { rating: 4.26 }, _count: { _all: 9 } },
        ]),
    },
  };
  const service = new ProviderCardsService(prisma as unknown as PrismaService);

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
        serviceArea: ['العاصمة'],
        logoUrl: 'logo.png',
        isVerified: true,
        lastActivityAt: '2026-09-20T10:00:00.000Z',
      },
    ]);
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
      whatsapp: '+96599990000',
    });
  });
});
