import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyRegisterOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
