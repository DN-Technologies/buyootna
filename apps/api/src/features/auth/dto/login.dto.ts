import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  identifier: string; // Can be email OR phone

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}
