import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMapBoundsDto } from './dto/get-map-bounds.dto';
import { MapService } from './map.service';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { MapDiscoverResponseDto } from './dto/map-discover-response.dto';

@ApiTags('Map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('discover')
  @ApiOperation({ summary: 'Discover properties or companies as map pins within a bounding box, as GeoJSON' })
  @ApiQuery({ type: GetMapBoundsDto })
  @ApiResponse({ status: 200, type: MapDiscoverResponseDto })
  @ApiCommonErrors()
  discover(@Query() dto: GetMapBoundsDto) {
    return this.mapService.discover(dto);
  }
}
