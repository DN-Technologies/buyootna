import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StandardSearchStrategy } from './strategies/standard-search.strategy';
import { ExchangeSearchStrategy } from './strategies/exchange-search.strategy';
import { CompanySearchStrategy } from './strategies/company-search.strategy';
import { AuctionSearchStrategy } from './strategies/auction-search.strategy';
import { DealSearchStrategy } from './strategies/deal-search.strategy';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: StandardSearchStrategy,
          useValue: {},
        },
        {
          provide: ExchangeSearchStrategy,
          useValue: {},
        },
        {
          provide: CompanySearchStrategy,
          useValue: {},
        },
        {
          provide: AuctionSearchStrategy,
          useValue: {},
        },
        {
          provide: DealSearchStrategy,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
