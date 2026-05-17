import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterIndividualDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^[569]\d{7}$|^01[0125][0-9]{8}$/, { message: 'رقم هاتف غير صالح' }) // Accepts Kuwait or Egypt
  phone: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}

export class RegisterCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
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
  @IsNotEmpty()
  licenseActivity: string;

  @IsString()
  @IsNotEmpty()
  licenseExpiry: string;
}
