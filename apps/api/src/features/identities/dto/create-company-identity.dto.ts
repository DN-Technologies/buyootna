import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class CreateCompanyIdentityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

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
}
