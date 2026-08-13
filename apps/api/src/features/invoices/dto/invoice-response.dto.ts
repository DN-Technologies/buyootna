import { ApiProperty } from '@nestjs/swagger';

export class InvoiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  invoiceNo: string;

  @ApiProperty()
  planName: string;

  @ApiProperty({ nullable: true })
  planDetails: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] })
  status: string;

  @ApiProperty({ nullable: true })
  paidAt: Date | null;

  @ApiProperty({ nullable: true })
  dueDate: Date | null;

  @ApiProperty({ nullable: true })
  delayDays: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  identityId: string | null;
}
