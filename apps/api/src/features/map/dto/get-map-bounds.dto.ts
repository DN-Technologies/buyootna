import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PropertyCategory } from '@prisma/client';

function toIdList(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parts = (Array.isArray(value) ? value : [value]).flatMap((v) =>
    String(v).split(','),
  );
  return [...new Set(parts.map((v) => v.trim()).filter(Boolean))];
}

export const MAP_PIN_TYPES = ['sell', 'rent', 'exchange', 'company'] as const;
export type MapPinType = (typeof MAP_PIN_TYPES)[number];

export class GetMapBoundsDto {
  @Type(() => Number)
  @IsNumber()
  ne_lat!: number;

  @Type(() => Number)
  @IsNumber()
  ne_lng!: number;

  @Type(() => Number)
  @IsNumber()
  sw_lat!: number;

  @Type(() => Number)
  @IsNumber()
  sw_lng!: number;

  @IsOptional()
  @IsIn(MAP_PIN_TYPES)
  type?: MapPinType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  governorateId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  areaId?: string;

  // Several at once, as a comma-separated list (?governorateIds=a,b) or a
  // repeated param; the single governorateId/areaId above stay for older
  // app builds
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toIdList(value))
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  governorateIds?: string[];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toIdList(value))
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  areaIds?: string[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  searchQuery?: string;

  // The rest narrow property pins the way GET /properties does, so a map
  // can show the same search as a list; company pins ignore them
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toIdList(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsEnum(PropertyCategory, { each: true, message: 'فئة العقار غير صالحة' })
  category?: PropertyCategory[];

  // An ad with no price shown never matches a price range
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // Exchange ads: سنة الطلب and السنة المطلوبة, each matched exactly
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  requestYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  requiredYear?: number;
}
