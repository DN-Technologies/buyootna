import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length, MaxLength } from 'class-validator';

export class TestingLoginDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  password: string;

  // Attached to everything this person does on the portal (the audit log)
  @ApiProperty({ example: 'Ahmed (QA)' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 60, { message: 'الاسم يجب أن يكون بين 2 و 60 حرفاً' })
  name: string;
}
