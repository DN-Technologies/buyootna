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

  @ApiProperty({ description: 'Paused alerts are skipped by matching' })
  isActive: boolean;

  @ApiProperty({ nullable: true })
  lastMatchedAt: Date | null;

  @ApiProperty({ description: 'Listings matched since the alert was created' })
  matchCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class AlertsBulkUpdateResponseDto {
  @ApiProperty({ description: 'Number of alerts updated' })
  count: number;
}

export class AlertsUnseenMatchesResponseDto {
  @ApiProperty({
    description:
      "Matches of the identity's active alerts on live listings, not opened yet",
  })
  count: number;

  @ApiProperty({
    nullable: true,
    description:
      'The alert they all belong to; null when there are none or several',
  })
  alertId: string | null;
}
