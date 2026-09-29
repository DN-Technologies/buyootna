import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** What an admin may change on a plan the app sells. */
export class AdminUpdatePlanDto {
  @ApiPropertyOptional({ example: 'الفضية' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(1, 40)
  name?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(100000)
  price?: number;

  @ApiPropertyOptional({ description: 'Hidden plans are not sold' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Ads a slot of this plan holds' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxActiveAds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  durationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxImagesPerAd?: number;

  @ApiPropertyOptional({ description: '0 = not featured' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  featuredDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  prioritySearch?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Lines the app lists' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  features?: string[];
}
