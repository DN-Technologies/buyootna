import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MaxLength } from 'class-validator';

export class TestingWipeDto {
  @ApiProperty({ example: 'buyootna-production' })
  @IsString()
  @MaxLength(64)
  confirm: string;

  @ApiProperty({ description: 'The DANGER password (not the sign-in one)' })
  @IsString()
  @MaxLength(200)
  dangerPassword: string;
}

export class TestingSeedDto {
  @ApiProperty({
    description: 'The password every seeded account signs in with',
  })
  @IsString()
  @Length(8, 72)
  password: string;
}
