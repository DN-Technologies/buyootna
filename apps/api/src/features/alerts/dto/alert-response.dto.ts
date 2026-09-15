import { ApiProperty } from '@nestjs/swagger';
import { AlertType, ListingType } from '@prisma/client';

export class AlertResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AlertType })
  type: AlertType;

  @ApiProperty({ enum: ListingType, nullable: true })
  operationType: ListingType | null;

  @ApiProperty()
  governorateId: string;

  @ApiProperty({ nullable: true })
  areaId: string | null;

  @ApiProperty({ nullable: true })
  categoryId: string | null;

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty({ nullable: true })
  rentValue: number | null;

  @ApiProperty({ nullable: true })
  areaSize: number | null;

  @ApiProperty({ nullable: true })
  rooms: number | null;

  @ApiProperty({ nullable: true })
  baths: number | null;

  @ApiProperty({ nullable: true })
  floors: number | null;

  @ApiProperty({ nullable: true })
  requestYear: number | null;

  @ApiProperty({ nullable: true })
  requiredYear: number | null;

  @ApiProperty({ type: [String] })
  amenities: string[];

  @ApiProperty({ nullable: true })
  startDate: Date | null;

  @ApiProperty({ nullable: true })
  endDate: Date | null;

  @ApiProperty()
  createdAt: Date;
}
