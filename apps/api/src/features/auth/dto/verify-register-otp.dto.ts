import { IsNotEmpty, IsString } from 'class-validator';

import { TermsAcceptanceDto } from './terms-acceptance.dto';

export class VerifyRegisterOtpDto extends TermsAcceptanceDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
