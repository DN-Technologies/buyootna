import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class AdminGrantExceptionalFeatureDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  adsCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  photosCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  priorityVisibility?: boolean;

  @IsOptional()
  @IsBoolean()
  featuredResultsVisibility?: boolean;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyApp?: boolean;
}
