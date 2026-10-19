import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class UpdateIndividualIdentityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateCompanyIdentityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  hqLocation?: string;

  @IsOptional()
  @IsString()
  serviceAreas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  @IsOptional()
  @IsString()
  licenseActivity?: string;

  @IsOptional()
  @IsString()
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  licenseFileUrl?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  specialty?: string;

  // مواعيد العمل: [{ day: 0-6 (Sunday first), open, ranges: [{ from, to }] }]
  // as an array, or as JSON text in a multipart body; null clears them.
  // Checked by parseWorkingHours in the service.
  @IsOptional()
  workingHours?: unknown;
}

export class UpdateOfficeIdentityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  hqLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  @IsOptional()
  @IsString()
  licenseActivity?: string;

  @IsOptional()
  @IsString()
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  licenseFileUrl?: string;

  // مواعيد العمل: [{ day: 0-6 (Sunday first), open, ranges: [{ from, to }] }]
  // as an array, or as JSON text in a multipart body; null clears them.
  // Checked by parseWorkingHours in the service.
  @IsOptional()
  workingHours?: unknown;
}
