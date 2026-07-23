import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewSortOption {
  ALL = 'all',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RATING_DESC = 'rating_desc',
  RATING_ASC = 'rating_asc',
}

export class GetReviewsDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(ReviewSortOption)
  sort?: ReviewSortOption;
}
