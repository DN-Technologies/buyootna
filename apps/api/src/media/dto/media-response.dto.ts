import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  url: string;
}

export class UploadListingImagesResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: [String] })
  urls: string[];
}
