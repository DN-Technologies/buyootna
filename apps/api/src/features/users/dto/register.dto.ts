import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsEmailOrPhone } from '../../../core/validators/is-email-or-phone.validator';

export class RegisterIndividualDto {
  @IsString()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @IsEmailOrPhone({ message: 'أدخل بريد إلكتروني أو رقم هاتف صحيح' })
  identifier: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}

export class RegisterCompanyDto {
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
  services?: string;

  @IsString()
  @IsOptional()
  hqLocation?: string;

  @IsString()
  @IsOptional()
  serviceAreas?: string;

  @IsString()
  @IsOptional()
  about?: string;

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

export class RegisterOfficeDto {
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
