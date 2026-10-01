import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReactivateAccountDto {
  @ApiProperty({
    description:
      'The reactivationTicket from the ACCOUNT_SCHEDULED_DEACTIVATION (409) login response',
  })
  @IsString()
  @IsNotEmpty()
  ticket: string;
}
