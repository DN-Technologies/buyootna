import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  deviceName: string;

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
