import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { GetPropertiesFilterDto } from '../dto/get-properties-filter.dto';
import { PropertiesFeedService } from './properties-feed.service';
import { IdentityStatsService } from '../../../core/trust-signals/identity-stats.service';

describe('PropertiesFeedService.findAll sorting', () => {
  const prisma = {
    property: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
  const service = new PropertiesFeedService(
    prisma as unknown as PrismaService,
    {} as IdentityStatsService,
  );

  const orderUsed = () =>
    (
      prisma.property.findMany.mock.calls as [Prisma.PropertyFindManyArgs][]
    )[0][0].orderBy;

  beforeEach(() => jest.clearAllMocks());

  it('keeps priority and featured ads first by default (الكل)', async () => {
    await service.findAll({});

    expect(orderUsed()).toEqual([
      { isPriority: 'desc' },
      { isFeatured: 'desc' },
      { publishedAt: { sort: 'desc', nulls: 'last' } },
      { id: 'asc' },
    ]);
  });

  it('sorts purely by publish date, newest first', async () => {
    await service.findAll({ sort: 'NEWEST' });

    expect(orderUsed()).toEqual([
      { publishedAt: { sort: 'desc', nulls: 'last' } },
      { id: 'asc' },
    ]);
  });

  it('sorts purely by publish date, oldest first', async () => {
    await service.findAll({ sort: 'OLDEST', type: 'SALE', page: 2, limit: 10 });

    expect(orderUsed()).toEqual([
      { publishedAt: { sort: 'asc', nulls: 'last' } },
      { id: 'asc' },
    ]);
    const args = (
      prisma.property.findMany.mock.calls as [Prisma.PropertyFindManyArgs][]
    )[0][0];
    expect(args.skip).toBe(10);
    expect(args.where).toMatchObject({ status: 'ACTIVE', type: 'SALE' });
  });

  const whereUsed = () =>
    (
      prisma.property.findMany.mock.calls as [Prisma.PropertyFindManyArgs][]
    )[0][0].where;

  it('narrows by governorate, area, category and a price range', async () => {
    await service.findAll({
      type: 'SALE',
      governorateId: 'capital',
      areaId: 'dasma',
      category: 'APARTMENT',
      minPrice: 50000,
      maxPrice: 150000,
    });

    expect(whereUsed()).toMatchObject({
      status: 'ACTIVE',
      type: 'SALE',
      governorateId: 'capital',
      areaId: 'dasma',
      category: 'APARTMENT',
      price: { gte: 50000, lte: 150000 },
    });
    // The count has to describe the same filtered set
    expect(prisma.property.count).toHaveBeenCalledWith({ where: whereUsed() });
  });

  it('takes a one-sided price range, and none of the filters by default', async () => {
    await service.findAll({ maxPrice: 900 });
    expect(whereUsed()).toMatchObject({ price: { lte: 900 } });

    jest.clearAllMocks();
    await service.findAll({});
    const where = whereUsed() as Record<string, unknown>;
    for (const key of ['governorateId', 'areaId', 'category', 'price']) {
      expect(where).not.toHaveProperty(key);
    }
  });

  it.each([
    ['PRICE_DESC', 'desc'],
    ['PRICE_ASC', 'asc'],
  ] as const)(
    '%s sorts purely by price, ads without a price last',
    async (sort, direction) => {
      await service.findAll({ sort });

      expect(orderUsed()).toEqual([
        { price: { sort: direction, nulls: 'last' } },
        { publishedAt: { sort: 'desc', nulls: 'last' } },
        { id: 'asc' },
      ]);
    },
  );

  it('rejects an unknown sort value in the query', async () => {
    const dto = plainToInstance(GetPropertiesFilterDto, { sort: 'CHEAPEST' });

    const errors = await validate(dto);

    expect(errors.find((e) => e.property === 'sort')).toBeDefined();
  });
});

describe('PropertiesFeedService.findOne host card', () => {
  const prisma = { property: { findUnique: jest.fn() } };
  const identityStats = {
    getOne: jest.fn().mockResolvedValue({ rating: 4.7, reviewsCount: 3 }),
  };
  const service = new PropertiesFeedService(
    prisma as unknown as PrismaService,
    identityStats as unknown as IdentityStatsService,
  );

  const withIdentity = (identity: Record<string, unknown>) =>
    prisma.property.findUnique.mockResolvedValue({
      id: 'p1',
      identity: {
        id: 'ident-1',
        type: 'INDIVIDUAL',
        createdAt: new Date('2026-09-01'),
        individualData: null,
        companyData: null,
        officeData: null,
        ...identity,
        user: {
          isDisabled: false,
          isBlocked: false,
          name: null,
          avatarUrl: null,
          ...(identity.user as object),
        },
      },
    });

  beforeEach(() => jest.clearAllMocks());

  it("falls back to the user's photo when the individual identity has none", async () => {
    withIdentity({
      individualData: { name: 'Ebrahim', avatarUrl: null },
      user: { name: 'Account name', avatarUrl: 'https://cdn/avatars/me.jpg' },
    });

    const { host } = await service.findOne('p1');

    expect(host.avatarUrl).toBe('https://cdn/avatars/me.jpg');
    expect(host.name).toBe('Ebrahim');
  });

  it("shows the host's real rating, not a constant", async () => {
    withIdentity({ individualData: { name: 'Ebrahim', avatarUrl: null } });

    const { host } = await service.findOne('p1');

    expect(identityStats.getOne).toHaveBeenCalledWith('ident-1');
    expect(host).toMatchObject({ rating: 4.7, reviewsCount: 3 });
  });

  it("prefers the identity's own photo over the user's", async () => {
    withIdentity({
      individualData: { name: 'Ebrahim', avatarUrl: 'https://cdn/ident.jpg' },
      user: { avatarUrl: 'https://cdn/avatars/me.jpg' },
    });

    expect((await service.findOne('p1')).host.avatarUrl).toBe(
      'https://cdn/ident.jpg',
    );
  });

  it('uses the user name when the identity has no name', async () => {
    withIdentity({ user: { name: 'Account name' } });

    expect((await service.findOne('p1')).host.name).toBe('Account name');
  });
});
