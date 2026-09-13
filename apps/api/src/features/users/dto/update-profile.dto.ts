import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';

export class UpdateProfileDto {
  // Individual / Company / Office name -- optional (a profile update may
  // touch only other fields), but if provided it can't be blank/whitespace
  // and is capped to keep it from overflowing the profile header, side
  // menu, and chat UI wherever the name is displayed.
  @Transform(trim)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @MaxLength(32, { message: 'الاسم يجب ألا يتجاوز 32 حرفاً' })
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
