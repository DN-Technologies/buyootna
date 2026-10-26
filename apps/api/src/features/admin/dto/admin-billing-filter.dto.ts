import { ApiPropertyOptional } from '@nestjs/swagger';
import { IdentityType, InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

class AdminBillingPageDto {
  @ApiPropertyOptional({ description: 'Name, email or phone of the owner' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: IdentityType,
    description: 'The owning persona type',
  })
  @IsOptional()
  @IsEnum(IdentityType)
  role?: IdentityType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

/** GET /admin/subscriptions */
export class AdminSubscriptionsFilterDto extends AdminBillingPageDto {
  @ApiPropertyOptional({
    enum: ['active', 'expired'],
    description:
      'active: a company period not ended / credits left; expired: the rest',
  })
  @IsOptional()
  @IsIn(['active', 'expired'])
  status?: 'active' | 'expired';

  @ApiPropertyOptional({
    description: "A plan's name, as listed in the response's planNames",
  })
  @IsOptional()
  @IsString()
  plan?: string;
}

/** GET /admin/invoices */
export class AdminInvoicesFilterDto extends AdminBillingPageDto {
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
