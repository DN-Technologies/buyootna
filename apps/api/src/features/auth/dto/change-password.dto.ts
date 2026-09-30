import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل',
  })
  newPassword: string;

  // Only required for accounts that have a phone on file -- see
  // AuthService.changePassword.
  @IsString()
  @IsOptional()
  otp?: string;

  @IsBoolean()
  @IsOptional()
  logoutAllDevices?: boolean;
}

/** Optional so older app builds (which send no body) keep working. */
export class RequestChangePasswordOtpDto {
  // Checked before any code is sent, so a typo costs no SMS
  @IsOptional()
  @IsString()
  oldPassword?: string;
}
