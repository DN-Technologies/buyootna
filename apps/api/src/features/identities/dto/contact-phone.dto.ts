import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetUseAccountPhoneDto {
  @ApiProperty({
    description:
      "true: reach this persona on the account's phone; false: on its own (already verified) number",
  })
  @IsBoolean()
  useAccountPhone: boolean;
}
