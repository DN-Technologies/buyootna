import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ListingType, PropertyCategory } from '@prisma/client';

/** "a, b ,c" (or an already-split value) → ['a', 'b', 'c']; empty → undefined. */
export function splitList(value: unknown): string[] | undefined {
  const parts = (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map((part) => String(part).trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

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
  // combined with AND. The first three take one value or several separated
  // by commas ("capital,hawally"), matching any of them.
  @IsOptional()
  @IsString()
  governorateId?: string;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => splitList(value))
  @IsEnum(PropertyCategory, { each: true, message: 'فئة العقار غير صالحة' })
  category?: PropertyCategory[];

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
