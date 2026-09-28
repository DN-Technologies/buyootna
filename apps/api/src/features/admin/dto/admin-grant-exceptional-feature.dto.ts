import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AdminGrantExceptionalFeatureDto {
  // The persona receiving the credits; defaults to the account's
  // individual persona, else its earliest
  @IsOptional()
  @IsString()
  identityId?: string;

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
