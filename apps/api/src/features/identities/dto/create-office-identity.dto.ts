import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class CreateOfficeIdentityDto {
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
}
