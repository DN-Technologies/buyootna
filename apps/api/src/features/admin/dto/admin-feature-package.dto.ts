import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AdminCreateFeaturePackageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsInt()
  @Min(1)
  durationDays: number;

  // KWD; 0 makes the package free (applied without the payment gateway)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminUpdateFeaturePackageDto extends PartialType(
  AdminCreateFeaturePackageDto,
) {}
