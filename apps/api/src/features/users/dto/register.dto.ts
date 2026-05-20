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
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  phone: string;

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
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  services: string;

  @IsString()
  @IsNotEmpty()
  hqLocation: string;

  @IsString()
  @IsNotEmpty()
  serviceAreas: string;

  @IsString()
  @IsNotEmpty()
  about: string;

  @IsString()
  @IsOptional()
  licenseActivity?: string;

  @IsString()
  @IsOptional()
  licenseExpiry?: string;
}
