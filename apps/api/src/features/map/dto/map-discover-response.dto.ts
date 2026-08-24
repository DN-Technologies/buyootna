import { ApiProperty } from '@nestjs/swagger';

class MapPinGeometryDto {
  @ApiProperty({ example: 'Point' })
  type: string;

  @ApiProperty({ type: [Number], description: '[longitude, latitude]' })
  coordinates: number[];
}

class MapPinPropertiesDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    nullable: true,
    description: 'Listing type for property pins, absent for company pins',
  })
  type?: string;

  @ApiProperty({ nullable: true })
  price?: number | null;

  @ApiProperty({
    nullable: true,
    description: 'Company logo URL, present only for company pins',
  })
  logoUrl?: string | null;
}

class MapPinFeatureDto {
  @ApiProperty({ example: 'Feature' })
  type: string;

  @ApiProperty({ type: MapPinGeometryDto })
  geometry: MapPinGeometryDto;

  @ApiProperty({ type: MapPinPropertiesDto })
  properties: MapPinPropertiesDto;
}

export class MapDiscoverResponseDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type: string;

  @ApiProperty({ type: [MapPinFeatureDto] })
  features: MapPinFeatureDto[];
}
