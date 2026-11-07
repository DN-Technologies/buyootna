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

  @ApiProperty({ enum: ['plan', 'subscription', 'feature'] })
  purpose: string;

  @ApiProperty({ example: 'العادية' })
  planName: string;

  @ApiProperty({ nullable: true })
  planDetails: string | null;

  @ApiProperty({
    nullable: true,
    description:
      "When what was bought ends: a subscription's period or a featured ad's end; null for ad packages",
  })
  endsAt: Date | null;
}

export class CheckoutQuoteResponseDto {
  @ApiProperty({ example: 'الباقة العادية' })
  title: string;

  @ApiProperty({ example: '5 إعلانات' })
  subtitle: string;

  @ApiProperty({ example: 5 })
  price: number;

  @ApiProperty({ example: 2 })
  discount: number;

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 'KWD' })
  currency: string;

  @ApiProperty({ nullable: true, example: 'WELCOME' })
  discountCode: string | null;

  @ApiProperty({
    example: ['apple_pay', 'google_pay', 'card', 'knet'],
    description: 'The payment methods this server offers (TAP_SOURCES)',
  })
  methods: string[];
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
