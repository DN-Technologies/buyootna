import {
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  StandardFilterDto,
  ExchangeFilterDto,
  CompanyFilterDto,
  AuctionFilterDto,
  DealFilterDto,
} from './advanced-filters.dto';

export enum FilterTab {
  SELL = 'sell',
  RENT = 'rent',
  EXCHANGE = 'exchange',
  COMPANIES = 'companies',
  AUCTIONS = 'auctions',
  DEALS = 'deals',
}

export class AdvancedSearchDto {
  @IsEnum(FilterTab, { message: 'Invalid search tab specified' })
  tab: FilterTab;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ValidateNested()
  @Type((opts) => {
    // Dynamic Polymorphic Validation:
    // This checks the parent object's "tab" value and assigns the correct validation class
    const tabValue = opts?.object?.tab as FilterTab | undefined;

    switch (tabValue) {
      case FilterTab.SELL:
      case FilterTab.RENT:
        return StandardFilterDto;
      case FilterTab.EXCHANGE:
        return ExchangeFilterDto;
      case FilterTab.COMPANIES:
        return CompanyFilterDto;
      case FilterTab.AUCTIONS:
        return AuctionFilterDto;
      case FilterTab.DEALS:
        return DealFilterDto;
      default:
        return Object; // Fallback to raw object if tab is missing/invalid
    }
  })
  filters:
    | StandardFilterDto
    | ExchangeFilterDto
    | CompanyFilterDto
    | AuctionFilterDto
    | DealFilterDto;
}
