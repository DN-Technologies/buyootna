import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class RegisterOfficeDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  hqLocation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  @IsString()
  @IsOptional()
  services?: string;

  @IsString()
  @IsOptional()
  licenseActivity?: string;

  @IsString()
  @IsNotEmpty({ message: 'رقم الرخصة مطلوب' })
  licenseNumber: string;

  @IsString()
  @IsOptional()
  licenseExpiry?: string;
}
