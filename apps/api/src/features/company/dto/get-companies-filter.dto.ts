import { IsIn, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const COMPANY_SORTS = [
  'NEWEST',
  'RATING_DESC',
  'RATING_ASC',
  'PROJECTS_DESC',
] as const;
export type CompanySort = (typeof COMPANY_SORTS)[number];

export class GetCompaniesFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  // الترتيب حسب; NEWEST (the default) keeps the plain createdAt order
  @IsOptional()
  @IsIn(COMPANY_SORTS)
  sort?: CompanySort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
