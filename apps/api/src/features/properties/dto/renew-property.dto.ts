import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RenewPropertyDto {
  @ApiPropertyOptional({
    description:
      "Wallet slot to spend (a plan slot id, or 'FREE_QUOTA'). Omit to use the free ad or the only active slot.",
  })
  @IsOptional()
  @IsString({ message: 'معرف الباقة غير صالح' })
  @MaxLength(64, { message: 'معرف الباقة غير صالح' })
  planSlotId?: string;
}
