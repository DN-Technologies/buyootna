import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ nullable: true })
  identityId: string | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({
    nullable: true,
    description:
      'Link target for the notification, e.g. { propertyId } for ALERT_MATCH',
    example: { propertyId: 'b1f2…' },
  })
  data: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}

export class UnreadCountResponseDto {
  @ApiProperty()
  count: number;
}

export class SuccessResponseDto {
  @ApiProperty()
  success: boolean;
}

export class NotificationPreferencesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  appEnabled: boolean;

  @ApiProperty()
  emailEnabled: boolean;

  @ApiProperty()
  phoneEnabled: boolean;
}
