import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// Define possible sorting options
export enum SortOption {
  RECENT = 'recent',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING = 'rating',
}

export class GetSearchFilterDto {
  // The text typed into the search bar (e.g., "شركة تشطيب")
  @IsOptional()
  @IsString()
  query?: string;

  // Pagination: Current Page
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  // Pagination: Items per page
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // Sorting preference
  @IsOptional()
  @IsEnum(SortOption)
  sortBy?: SortOption = SortOption.RECENT;
}
