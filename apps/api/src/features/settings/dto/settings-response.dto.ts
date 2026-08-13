import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  showPhone: boolean;

  @ApiProperty()
  showWhatsapp: boolean;

  @ApiProperty()
  hideActivity: boolean;

  @ApiProperty()
  hideOfficeAds: boolean;
}
