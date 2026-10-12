import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType, PropertyCategory } from '@prisma/client';

export const PROPERTY_SORTS = [
  'DEFAULT',
  'NEWEST',
  'OLDEST',
  'PRICE_DESC',
  'PRICE_ASC',
] as const;
export type PropertySort = (typeof PROPERTY_SORTS)[number];

export class GetPropertiesFilterDto {
  @IsOptional()
  @IsEnum(ListingType, { message: 'نوع الإعلان غير صالح' })
  type?: ListingType;

  @IsOptional()
  @IsString()
  identityId?: string;

  // Search filters (the web landing's hero search). All optional and
  // combined with AND.
  @IsOptional()
  @IsString()
  governorateId?: string;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsEnum(PropertyCategory, { message: 'فئة العقار غير صالحة' })
  category?: PropertyCategory;

  // An ad with no price shown never matches a price range
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'أقل سعر يجب أن يكون رقماً' })
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'أعلى سعر يجب أن يكون رقماً' })
  @Min(0)
  maxPrice?: number;

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
  // by publish date; PRICE_DESC/PRICE_ASC: purely by price (ads without a
  // price last) -- so the user sees exactly the order they asked for.
  @IsOptional()
  @IsIn(PROPERTY_SORTS, { message: 'طريقة الترتيب غير صالحة' })
  sort?: PropertySort;
}
