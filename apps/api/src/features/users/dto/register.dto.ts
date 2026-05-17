import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterIndividualDto {
  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  identifier: string; // Can be email OR phone

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
