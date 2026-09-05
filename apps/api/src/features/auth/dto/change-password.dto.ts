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
