import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { TermsAcceptanceDto } from './terms-acceptance.dto';

export class VerifyEmailOtpDto extends TermsAcceptanceDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
