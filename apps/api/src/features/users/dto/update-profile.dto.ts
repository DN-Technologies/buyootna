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
}
