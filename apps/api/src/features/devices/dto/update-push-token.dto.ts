import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, ValidateIf } from 'class-validator';

export class UpdatePushTokenDto {
  @ApiProperty({
    nullable: true,
    description:
      'Expo push token for this device (ExponentPushToken[...]), or null to stop push on this device',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Matches(/^Expo(nent)?PushToken\[.+\]$/, {
    message: 'رمز الإشعارات غير صالح',
  })
  token: string | null;
}
