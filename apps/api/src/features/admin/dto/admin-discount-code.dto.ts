import { PartialType } from '@nestjs/swagger';
import { DiscountPurpose, DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** «أكواد الخصم» in the admin portal. */
export class AdminCreateDiscountCodeDto {
  // Letters, digits, - and _; stored upper-case
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'الكود يقبل الحروف الإنجليزية والأرقام و - و _ فقط',
  })
  code: string;

  @IsEnum(DiscountType)
  type: DiscountType;

  // PERCENT: 1-100; FIXED: KWD off
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  value: number;

  // A cap on what a percent code takes off (KWD)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  maxDiscount?: number | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  minAmount?: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(DiscountPurpose, { each: true })
  appliesTo: DiscountPurpose[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  maxUses?: number | null;

  @IsOptional()
  @IsBoolean()
  onePerAccount?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // «إظهار في صفحة الباقات»: the plans screen's banner
  @IsOptional()
  @IsBoolean()
  showOnPlans?: boolean;
}

export class AdminUpdateDiscountCodeDto extends PartialType(
  AdminCreateDiscountCodeDto,
) {}
