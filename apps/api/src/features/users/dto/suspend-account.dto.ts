import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

// The reason ids the app's deactivation sheet offers
export const SUSPEND_REASONS = [
  'temp_break',
  'not_using',
  'technical',
  'other',
] as const;

// The periods the sheet offers; no value = until the user signs in again
export const SUSPEND_DURATIONS = [7, 14, 30] as const;

export class SuspendAccountDto {
  @ApiProperty({ example: '123456' })
  @IsString({ message: 'رمز التحقق مطلوب' })
  @Length(6, 6, { message: 'رمز التحقق يجب أن يكون 6 أرقام' })
  @Matches(/^\d{6}$/, { message: 'رمز التحقق يجب أن يكون 6 أرقام' })
  otp: string;

  @ApiProperty({ enum: SUSPEND_REASONS, isArray: true })
  @IsArray()
  @ArrayMinSize(1, { message: 'يرجى اختيار سبب واحد على الأقل' })
  @ArrayMaxSize(SUSPEND_REASONS.length)
  @IsIn(SUSPEND_REASONS, { each: true, message: 'سبب غير صالح' })
  reasons: string[];

  @ApiPropertyOptional({ description: 'The "أخرى" free text' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'السبب طويل جداً' })
  note?: string;

  @ApiPropertyOptional({
    enum: SUSPEND_DURATIONS,
    description:
      'Reactivate automatically after this many days; omit for "until I sign in again"',
  })
  @IsOptional()
  @IsIn(SUSPEND_DURATIONS, { message: 'مدة التعطيل غير صالحة' })
  durationDays?: number;
}
