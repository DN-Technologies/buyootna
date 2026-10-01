import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';

export const INVOICE_SORTS = ['newest', 'oldest'] as const;
export type InvoiceSort = (typeof INVOICE_SORTS)[number];

export class ListServiceInvoicesDto {
  @ApiPropertyOptional({
    description: 'Matches the invoice number, the service or the company name',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: INVOICE_SORTS, default: 'newest' })
  @IsOptional()
  @IsIn(INVOICE_SORTS, { message: 'ترتيب غير صالح' })
  sort?: InvoiceSort;
}
