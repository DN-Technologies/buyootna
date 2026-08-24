import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
