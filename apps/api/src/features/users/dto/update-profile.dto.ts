import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  // Company / Office fields
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  hqLocation?: string;

  @IsString()
  @IsOptional()
  about?: string;

  // Company-specific fields
  @IsString()
  @IsOptional()
  services?: string;

  @IsString()
  @IsOptional()
  serviceAreas?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  // Individual fields
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
