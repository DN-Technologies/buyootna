import { ApiProperty } from '@nestjs/swagger';
import { DocsRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length, MaxLength } from 'class-validator';

export class DocsLoginDto {
  @ApiProperty({ enum: DocsRole })
  @IsEnum(DocsRole, { message: 'الدور غير صالح' })
  role: DocsRole;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  password: string;

  // Attached to everything this person records on the portal
  @ApiProperty({ example: 'Sara (QA)' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 60, { message: 'الاسم يجب أن يكون بين 2 و 60 حرفاً' })
  name: string;
}
