import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Email or Phone
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @Length(6, 6, { message: 'رمز التحقق يجب أن يكون 6 أرقام' })
  otp: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string; // The temporary JWT they get after verifying OTP

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  newPassword: string;
}
