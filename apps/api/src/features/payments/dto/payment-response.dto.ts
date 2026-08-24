import { ApiProperty } from '@nestjs/swagger';

export class CreateChargeResponseDto {
  @ApiProperty({
    nullable: true,
    description:
      'Tap Payments checkout URL to redirect the client to, null if the invoice was already paid',
  })
  checkoutUrl: string | null;

  @ApiProperty()
  invoiceId: string;

  @ApiProperty({ enum: ['PENDING', 'PAID'] })
  status: string;
}

export class InvoiceStatusResponseDto {
  @ApiProperty({ enum: ['PAID', 'PENDING', 'OVERDUE', 'CANCELLED'] })
  status: string;
}
