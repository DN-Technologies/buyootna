import { ApiProperty } from '@nestjs/swagger';

export class RecoveryMessageResponseDto {
  @ApiProperty()
  message: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({
    description: 'Temporary JWT authorizing the password reset step',
  })
  resetToken: string;
}
