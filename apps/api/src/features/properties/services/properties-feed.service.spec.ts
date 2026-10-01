import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { GetPropertiesFilterDto } from '../dto/get-properties-filter.dto';
import { PropertiesFeedService } from './properties-feed.service';

describe('PropertiesFeedService.findAll sorting', () => {
  const prisma = {
    property: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
  const service = new PropertiesFeedService(prisma as unknown as PrismaService);

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
