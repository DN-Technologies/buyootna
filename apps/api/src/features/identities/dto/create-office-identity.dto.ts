import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
