import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

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
