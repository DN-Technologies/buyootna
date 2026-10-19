import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

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
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
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

  // A string keeps or (once verified) changes the address; an explicit
  // null removes it, allowed only for an account that signs in by phone
  @IsString()
  @IsOptional()
  email?: string | null;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
