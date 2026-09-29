import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { DOCS_PASSWORD_MIN_LENGTH } from '../docs-portal.constants';

export class SetDocsPasswordDto {
  @ApiProperty({ minLength: DOCS_PASSWORD_MIN_LENGTH })
  @IsString()
  @Length(DOCS_PASSWORD_MIN_LENGTH, 128, {
    message: `كلمة المرور يجب أن تكون ${DOCS_PASSWORD_MIN_LENGTH} أحرف على الأقل`,
  })
  password: string;
}
