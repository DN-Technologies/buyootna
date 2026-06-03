import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { SearchController } from 'src/features/search/search.controller';
import { SearchService } from 'src/features/search/search.service';

// Strategies
import { StandardSearchStrategy } from './strategies/standard-search.strategy';
import { ExchangeSearchStrategy } from './strategies/exchange-search.strategy';
import { CompanySearchStrategy } from './strategies/company-search.strategy';
import { AuctionSearchStrategy } from './strategies/auction-search.strategy';
import { DealSearchStrategy } from './strategies/deal-search.strategy';

@Module({
  imports: [PrismaModule], // Inject Prisma to interact with the DB
  controllers: [SearchController],
  providers: [
    SearchService,
    StandardSearchStrategy,
    ExchangeSearchStrategy,
    CompanySearchStrategy,
    AuctionSearchStrategy,
    DealSearchStrategy,
  ],
})
export class SearchModule {}
