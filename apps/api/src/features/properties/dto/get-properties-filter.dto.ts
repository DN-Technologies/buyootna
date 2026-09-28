import {
  IsEnum,
  IsIn,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType } from '@prisma/client';

export const PROPERTY_SORTS = ['DEFAULT', 'NEWEST', 'OLDEST'] as const;
export type PropertySort = (typeof PROPERTY_SORTS)[number];

export class GetPropertiesFilterDto {
  @IsOptional()
  @IsEnum(ListingType, { message: 'نوع الإعلان غير صالح' })
  type?: ListingType;

  @IsOptional()
  @IsString()
  identityId?: string;

  // The @Type decorator ensures the URL query string "?page=2" is converted to a number
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

  // DEFAULT: priority, then featured, then newest. NEWEST/OLDEST: purely
  // by publish date, so the user sees exactly the order they asked for.
  @IsOptional()
  @IsIn(PROPERTY_SORTS, { message: 'طريقة الترتيب غير صالحة' })
  sort?: PropertySort;
}
