import { Test, TestingModule } from '@nestjs/testing';
import { StandardSearchStrategy } from './standard-search.strategy';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('StandardSearchStrategy', () => {
  let strategy: StandardSearchStrategy;
  let prisma: {
    property: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      property: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StandardSearchStrategy,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    strategy = module.get<StandardSearchStrategy>(StandardSearchStrategy);
  });

  it('does not filter by category when the category list is empty (mobile default state)', async () => {
    await strategy.execute({ type: 'sell', category: [] } as any, 1, 10);

    // The strategy's own filter; the public-listing rules are ANDed with it
    const where = prisma.property.findMany.mock.calls[0][0].where.AND[0];
    expect(where.category).toBeUndefined();
  });

  it('filters by category using an "in" clause when categories are provided', async () => {
    await strategy.execute(
      { type: 'sell', category: ['apartment', 'villa'] } as any,
      1,
      10,
    );

    // The strategy's own filter; the public-listing rules are ANDed with it
    const where = prisma.property.findMany.mock.calls[0][0].where.AND[0];
    expect(where.category).toEqual({ in: ['APARTMENT', 'VILLA'] });
  });

  it('filters by governorateId/areaId when locations are provided', async () => {
    await strategy.execute(
      {
        type: 'sell',
        govs: [{ id: 'capital', label: 'العاصمة' }],
        areas: [{ id: 'capital_1', label: 'مدينة جابر الأحمد' }],
      } as any,
      1,
      10,
    );

    // The strategy's own filter; the public-listing rules are ANDed with it
    const where = prisma.property.findMany.mock.calls[0][0].where.AND[0];
    expect(where.governorateId).toEqual({ in: ['capital'] });
    expect(where.areaId).toEqual({ in: ['capital_1'] });
  });
});
