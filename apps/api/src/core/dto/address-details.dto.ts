import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../validators/trim.transform';

/**
 * The address parts the location picker collects beyond the map point:
 * القطعة / الشارع / الجادة / المنزل والمبنى / علامة مميزة. All optional;
 * stored as JSON on the property, request or saved place.
 */
export class AddressDetailsDto {
  @ApiPropertyOptional({ example: '6' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60, { message: 'رقم القطعة طويل جداً' })
  block?: string;

  @ApiPropertyOptional({ example: 'شارع أحمد الجابر' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60, { message: 'اسم الشارع طويل جداً' })
  street?: string;

  @ApiPropertyOptional({ example: '3' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60, { message: 'رقم الجادة طويل جداً' })
  avenue?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60, { message: 'رقم المنزل طويل جداً' })
  building?: string;

  @ApiPropertyOptional({ example: 'بجانب الجمعية' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200, { message: 'العلامة المميزة طويلة جداً' })
  landmark?: string;
}

const KEYS = ['block', 'street', 'avenue', 'building', 'landmark'] as const;

/** Only the filled parts, as plain JSON; null when nothing is filled. */
export function toAddressDetailsJson(
  details?: AddressDetailsDto | null,
): Record<string, string> | null {
  if (!details) return null;
  const out: Record<string, string> = {};
  for (const key of KEYS) {
    const value = details[key]?.trim();
    if (value) out[key] = value;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * The Prisma write for addressDetails: nothing when the field was not sent
 * (an update leaves it as it is), the JSON when sent, and a cleared column
 * when sent empty.
 */
export function addressDetailsWrite(details: AddressDetailsDto | undefined) {
  if (details === undefined) return {};
  return { addressDetails: toAddressDetailsJson(details) ?? Prisma.DbNull };
}
