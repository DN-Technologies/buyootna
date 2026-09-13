import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty({ nullable: true, enum: ['ios', 'android'] })
  platform: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'Device model name (e.g. "iPhone 13 Pro Max", "Pixel 7", "SM-G991B")',
  })
  deviceModel: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastActive: Date;

  @ApiProperty({ nullable: true })
  location: string | null;

  @ApiProperty({ nullable: true })
  ipAddress: string | null;

  @ApiProperty({ nullable: true })
  userAgent: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class RevokeDeviceResponseDto {
  @ApiProperty()
  count: number;
}
