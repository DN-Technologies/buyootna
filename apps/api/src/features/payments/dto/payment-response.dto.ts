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

export class FeaturePackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'تمييز لاسبوع' })
  label: string;

  @ApiProperty({ example: 'ظهور أقوى لمدة أطول.' })
  description: string;

  @ApiProperty({ example: 7 })
  durationDays: number;

  @ApiProperty({ example: 3, description: 'Price in KWD' })
  price: number;
}
