import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterIndividualDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

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
