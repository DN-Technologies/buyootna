import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}
