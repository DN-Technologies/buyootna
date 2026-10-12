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

  // التخصص, e.g. "مكتب هندسي"; several separated by commas match any
  @IsOptional()
  @IsString()
  specialty?: string;

  // Governorate or area names ("حولي,السالمية"), matched against where
  // the company is based and the areas it serves
  @IsOptional()
  @IsString()
  location?: string;

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
