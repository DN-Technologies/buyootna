import { Controller, Get, Query } from '@nestjs/common';
import { GetMapBoundsDto } from './dto/get-map-bounds.dto';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('discover')
  discover(@Query() dto: GetMapBoundsDto) {
    return this.mapService.discover(dto);
  }
}
