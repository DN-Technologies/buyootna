import { Test, TestingModule } from '@nestjs/testing';
import {
  UsersDirectoryService,
  sortCompanyCards,
} from '../users-directory.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ProviderCardsService } from '../provider-cards.service';
import { IdentityStatsService } from '../../../../core/trust-signals/identity-stats.service';

// The subscription gate has its own spec; here every company is subscribed
jest.mock(
  'src/features/company-subscriptions/company-subscription.rules',
  () => ({
    ...jest.requireActual(
      'src/features/company-subscriptions/company-subscription.rules',
    ),
    assertActiveCompanySubscription: jest.fn().mockResolvedValue(undefined),
    hasActiveCompanySubscription: jest.fn().mockResolvedValue(true),
    grantTrialIfNew: jest.fn().mockResolvedValue(undefined),
  }),
);

describe('UsersDirectoryService', () => {
  let service: UsersDirectoryService;
  const prisma = {
    identity: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
  };
  const identityStats = {
    getOne: jest.fn().mockResolvedValue({
      rating: 0,
      reviewsCount: 0,
      soldCount: 0,
      presence: { isOnline: false, lastSeenAt: null },
    }),
    getResponseTime: jest.fn().mockResolvedValue(null),
  };
  const providerCards = { formatCompanyCards: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersDirectoryService,
        { provide: ProviderCardsService, useValue: providerCards },
        { provide: PrismaService, useValue: prisma },
        { provide: IdentityStatsService, useValue: identityStats },
      ],
    }).compile();

    service = module.get<UsersDirectoryService>(UsersDirectoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const card = (id: string, rating: number, projects: number, reviews = 1) =>
    ({
      id,
      rating,
      reviewsCount: reviews,
      projectsCount: String(projects),
    }) as never;

  describe('findCompanies sort', () => {
    it('NEWEST pages in the DB (skip/take) like before', async () => {
      prisma.identity.findMany.mockResolvedValue([{ id: 'a' }]);
      prisma.identity.count.mockResolvedValue(11);
      providerCards.formatCompanyCards.mockResolvedValue([card('a', 4, 1)]);

      const res = await service.findCompanies({ page: 2, limit: 10 });

      expect(prisma.identity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(res.meta).toMatchObject({ total: 11, hasNextPage: false });
    });

    it('RATING_DESC sorts every match, then pages', async () => {
      prisma.identity.findMany.mockResolvedValue([]);
      providerCards.formatCompanyCards.mockResolvedValue([
        card('a', 3, 0),
        card('b', 5, 0),
        card('c', 4, 0),
      ]);

      const res = await service.findCompanies({
        sort: 'RATING_DESC',
        page: 1,
        limit: 2,
      });

      const [findArgs] = prisma.identity.findMany.mock.calls[0] as [object];
      expect(findArgs).not.toHaveProperty('skip');
      expect(res.data.map((c) => c.id)).toEqual(['b', 'c']);
      expect(res.meta).toMatchObject({ total: 3, hasNextPage: true });
    });
  });

  describe('sortCompanyCards', () => {
    const cards = [card('a', 4, 2, 1), card('b', 4, 9, 5), card('c', 2, 5)];

    it('RATING_ASC / RATING_DESC break rating ties by review count', () => {
      expect(sortCompanyCards(cards, 'RATING_DESC').map((c) => c.id)).toEqual([
        'b',
        'a',
        'c',
      ]);
      expect(sortCompanyCards(cards, 'RATING_ASC').map((c) => c.id)).toEqual([
        'c',
        'a',
        'b',
      ]);
    });

    it('PROJECTS_DESC orders by numeric project count', () => {
      expect(sortCompanyCards(cards, 'PROJECTS_DESC').map((c) => c.id)).toEqual(
        ['b', 'c', 'a'],
      );
    });

    it('NEWEST keeps the incoming order', () => {
      expect(sortCompanyCards(cards, 'NEWEST')).toBe(cards);
    });
  });

  describe('findCompanyDetails gallery', () => {
    it('returns every photo of each project for the full-screen viewer', async () => {
      prisma.identity.findFirst.mockResolvedValue({
        id: 'c1',
        userId: 'u1',
        type: 'COMPANY',
        useAccountPhone: true,
        contactPhone: null,
        user: { phone: '99990000' },
        companyData: {
          name: 'شركة',
          services: null,
          logoUrl: null,
          isVerified: false,
          about: null,
          hqLocation: null,
          serviceAreas: null,
        },
        properties: [],
        projects: [
          {
            id: 'p1',
            title: 'فيلا',
            description: null,
            images: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
            createdAt: new Date('2026-09-01'),
          },
        ],
      });

      const res = await service.findCompanyDetails('c1');

      expect(res.projects[0]).toMatchObject({
        imageUrl: 'https://cdn/a.jpg',
        images: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
      });
    });
  });
});
